import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { collectors } from "../../db/schema/collectors";
import { roles } from "../../db/schema/roles";
import { users } from "../../db/schema/users";
import { wards } from "../../db/schema/wards";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { AppError } from "../../middleware/error.middleware";

export async function listCollectors(query: { page?: number | string; limit?: number | string; search?: string; status?: string; wardId?: string }) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(users.firstName, search), ilike(users.lastName, search), ilike(users.email, search)) as never);
	}

	if (query.status) {
		conditions.push(eq(collectors.status, query.status as never));
	}

	if (query.wardId) {
		conditions.push(eq(collectors.wardId, query.wardId));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const [countRow] = await db.select({ value: count() }).from(collectors).leftJoin(users, eq(collectors.userId, users.id)).where(whereClause);

	const rows = await db
		.select({
			id: collectors.id,
			userId: collectors.userId,
			wardId: collectors.wardId,
			employeeNumber: collectors.employeeNumber,
			status: collectors.status,
			createdAt: collectors.createdAt,
			updatedAt: collectors.updatedAt,
			userFirstName: users.firstName,
			userLastName: users.lastName,
			userEmail: users.email,
			userRole: roles.name,
			wardName: wards.name,
			wardCode: wards.code
		})
		.from(collectors)
		.innerJoin(users, eq(collectors.userId, users.id))
		.innerJoin(roles, eq(users.roleId, roles.id))
		.leftJoin(wards, eq(collectors.wardId, wards.id))
		.where(whereClause)
		.orderBy(desc(collectors.createdAt))
		.limit(limit)
		.offset(offset);

	return { rows, meta: buildPaginationMeta(page, limit, countRow?.value ?? 0) };
}

export async function getCollectorById(id: string) {
	const [collector] = await db
		.select({
			id: collectors.id,
			userId: collectors.userId,
			wardId: collectors.wardId,
			employeeNumber: collectors.employeeNumber,
			status: collectors.status,
			createdAt: collectors.createdAt,
			updatedAt: collectors.updatedAt,
			userFirstName: users.firstName,
			userLastName: users.lastName,
			userEmail: users.email,
			userRole: roles.name,
			wardName: wards.name,
			wardCode: wards.code
		})
		.from(collectors)
		.innerJoin(users, eq(collectors.userId, users.id))
		.innerJoin(roles, eq(users.roleId, roles.id))
		.leftJoin(wards, eq(collectors.wardId, wards.id))
		.where(eq(collectors.id, id))
		.limit(1);

	if (!collector) {
		throw new AppError("Collector not found", 404, "COLLECTOR_NOT_FOUND");
	}

	return collector;
}

export async function createCollector(input: { userId: string; wardId?: string | null; employeeNumber?: string; status?: string }, actorId?: string | null) {
	const [userRecord] = await db.select({ id: users.id, roleName: roles.name }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, input.userId)).limit(1);

	if (!userRecord) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	if (userRecord.roleName !== "collector") {
		throw new AppError("Collector user must have collector role", 400, "INVALID_ROLE");
	}

	const [existing] = await db.select({ id: collectors.id }).from(collectors).where(eq(collectors.userId, input.userId)).limit(1);
	if (existing) {
		throw new AppError("Collector already exists for this user", 409, "COLLECTOR_EXISTS");
	}

	const [collector] = await db
		.insert(collectors)
		.values({
			userId: input.userId,
			wardId: input.wardId ?? null,
			employeeNumber: input.employeeNumber ?? null,
			status: (input.status ?? "active") as "active" | "inactive"
		})
		.returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "collector_created",
		entityType: "collector",
		entityId: collector.id,
		metadata: input,
		ipAddress: null
	});
	return collector;
}

export async function updateCollector(id: string, input: { wardId?: string | null; employeeNumber?: string | null; status?: string }, actorId?: string | null) {
	await getCollectorById(id);
	const [collector] = await db
		.update(collectors)
		.set({
			...(input.wardId !== undefined ? { wardId: input.wardId } : {}),
			...(input.employeeNumber !== undefined ? { employeeNumber: input.employeeNumber } : {}),
			...(input.status !== undefined ? { status: input.status as "active" | "inactive" } : {})
		})
		.where(eq(collectors.id, id))
		.returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "collector_updated",
		entityType: "collector",
		entityId: id,
		metadata: input,
		ipAddress: null
	});
	return collector;
}
