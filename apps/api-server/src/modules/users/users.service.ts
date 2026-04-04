import bcrypt from "bcrypt";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { env } from "../../config/env";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { roles } from "../../db/schema/roles";
import { users } from "../../db/schema/users";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { AppError } from "../../middleware/error.middleware";

type ListUsersQuery = {
	page?: number | string;
	limit?: number | string;
	search?: string;
	roleName?: "admin" | "finance_officer" | "collector";
	isActive?: boolean;
};

async function resolveRoleId(roleName: string) {
	const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, roleName as never)).limit(1);

	if (!role) {
		throw new AppError(`Role ${roleName} not found`, 400, "ROLE_NOT_FOUND");
	}

	return role.id;
}

function buildUserSelect() {
	return {
		id: users.id,
		roleId: users.roleId,
		firstName: users.firstName,
		lastName: users.lastName,
		email: users.email,
		phoneNumber: users.phoneNumber,
		isActive: users.isActive,
		lastLoginAt: users.lastLoginAt,
		createdAt: users.createdAt,
		updatedAt: users.updatedAt,
		roleName: roles.name
	};
}

function buildUserReturningSelect() {
	return {
		id: users.id,
		roleId: users.roleId,
		firstName: users.firstName,
		lastName: users.lastName,
		email: users.email,
		phoneNumber: users.phoneNumber,
		isActive: users.isActive,
		lastLoginAt: users.lastLoginAt,
		createdAt: users.createdAt,
		updatedAt: users.updatedAt
	};
}

export async function listUsers(query: ListUsersQuery) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(users.firstName, search), ilike(users.lastName, search), ilike(users.email, search)) as never);
	}

	if (query.roleName) {
		conditions.push(eq(roles.name, query.roleName as never));
	}

	if (typeof query.isActive === "boolean") {
		conditions.push(eq(users.isActive, query.isActive));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [countRow] = await db.select({ value: count() }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(whereClause);

	const rows = await db
		.select(buildUserSelect())
		.from(users)
		.innerJoin(roles, eq(users.roleId, roles.id))
		.where(whereClause)
		.orderBy(desc(users.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		rows,
		meta: buildPaginationMeta(page, limit, countRow?.value ?? 0)
	};
}

export async function getUserById(id: string) {
	const [user] = await db
		.select(buildUserSelect())
		.from(users)
		.innerJoin(roles, eq(users.roleId, roles.id))
		.where(eq(users.id, id))
		.limit(1);

	if (!user) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	return user;
}

export async function createUser(input: { firstName: string; lastName: string; email: string; phoneNumber?: string; password: string; roleName: string }, actorId?: string | null) {
	const roleId = await resolveRoleId(input.roleName);
	const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);

	if (existingUser.length > 0) {
		throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
	}

	const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

	const [created] = await db
		.insert(users)
		.values({
			roleId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email.toLowerCase(),
			phoneNumber: input.phoneNumber ?? null,
			passwordHash,
			isActive: true
		})
		.returning(buildUserReturningSelect());

	await db.insert(auditLogs).values({
		userId: actorId ?? created.id,
		action: "user_created",
		entityType: "user",
		entityId: created.id,
		metadata: {
			email: created.email,
			roleName: input.roleName
		},
		ipAddress: null
	});

	return getUserById(created.id);
}

export async function updateUser(id: string, input: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string | null; isActive?: boolean; roleName?: string }, actorId?: string | null) {
	await getUserById(id);

	const updateData: Record<string, unknown> = {};

	if (input.firstName !== undefined) updateData.firstName = input.firstName;
	if (input.lastName !== undefined) updateData.lastName = input.lastName;
	if (input.email !== undefined) updateData.email = input.email.toLowerCase();
	if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
	if (input.isActive !== undefined) updateData.isActive = input.isActive;
	if (input.roleName !== undefined) updateData.roleId = await resolveRoleId(input.roleName);

	const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning({ id: users.id });

	if (!updated) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	await db.insert(auditLogs).values({
		userId: actorId ?? id,
		action: "user_updated",
		entityType: "user",
		entityId: id,
		metadata: input,
		ipAddress: null
	});

	return getUserById(updated.id);
}
