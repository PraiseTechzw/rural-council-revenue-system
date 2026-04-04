import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { collectors } from "../../db/schema/collectors";
import { roles } from "../../db/schema/roles";
import { users } from "../../db/schema/users";
import { wards } from "../../db/schema/wards";
import { AppError } from "../../middleware/error.middleware";
import type { AuthTokens, AuthUser, ChangePasswordInput, LoginInput, LoginResult } from "./auth.types";

type UserCredentialsRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string | null;
	passwordHash: string;
	role: string;
	isActive: boolean;
	collectorId: string | null;
	collectorStatus: "active" | "inactive" | null;
	wardId: string | null;
	wardName: string | null;
};

function sanitizeUser(user: UserCredentialsRow): AuthUser {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		phoneNumber: user.phoneNumber,
		collectorId: user.collectorId,
		collectorStatus: user.collectorStatus,
		wardId: user.wardId,
		wardName: user.wardName
	};
}

function buildTokens(user: AuthUser): AuthTokens {
	const accessToken = jwt.sign(
		{
			sub: user.id,
			role: user.role,
			email: user.email,
			tokenType: "access"
		},
		env.JWT_SECRET as Secret,
		{ expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] }
	);

	const refreshToken = jwt.sign(
		{
			sub: user.id,
			role: user.role,
			email: user.email,
			tokenType: "refresh"
		},
		env.JWT_REFRESH_SECRET as Secret,
		{ expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] }
	);

	return {
		accessToken,
		refreshToken,
		expiresIn: env.JWT_EXPIRES_IN,
		refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
	};
}

async function findUserByEmail(email: string) {
	const [userRecord] = await db
		.select({
			id: users.id,
			firstName: users.firstName,
			lastName: users.lastName,
			email: users.email,
			phoneNumber: users.phoneNumber,
			passwordHash: users.passwordHash,
			isActive: users.isActive,
			role: roles.name,
			collectorId: collectors.id,
			collectorStatus: collectors.status,
			wardId: collectors.wardId,
			wardName: wards.name
		})
		.from(users)
		.innerJoin(roles, eq(users.roleId, roles.id))
		.leftJoin(collectors, eq(collectors.userId, users.id))
		.leftJoin(wards, eq(collectors.wardId, wards.id))
		.where(eq(users.email, email.toLowerCase()))
		.limit(1);

	return userRecord ?? null;
}

async function findUserById(id: string) {
	const [userRecord] = await db
		.select({
			id: users.id,
			firstName: users.firstName,
			lastName: users.lastName,
			email: users.email,
			phoneNumber: users.phoneNumber,
			passwordHash: users.passwordHash,
			isActive: users.isActive,
			role: roles.name,
			collectorId: collectors.id,
			collectorStatus: collectors.status,
			wardId: collectors.wardId,
			wardName: wards.name
		})
		.from(users)
		.innerJoin(roles, eq(users.roleId, roles.id))
		.leftJoin(collectors, eq(collectors.userId, users.id))
		.leftJoin(wards, eq(collectors.wardId, wards.id))
		.where(eq(users.id, id))
		.limit(1);

	return userRecord ?? null;
}

export async function login(input: LoginInput): Promise<LoginResult> {
	const userRecord = await findUserByEmail(input.email);

	if (!userRecord) {
		throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
	}

	if (!userRecord.isActive) {
		throw new AppError("Your account is inactive. Contact an administrator.", 403, "ACCOUNT_INACTIVE");
	}

	if (userRecord.role === "collector") {
		if (!userRecord.collectorId) {
			throw new AppError("Collector profile is not assigned yet. Contact an administrator.", 403, "COLLECTOR_NOT_ASSIGNED");
		}

		if (userRecord.collectorStatus !== "active") {
			throw new AppError("Collector assignment is inactive. Contact an administrator.", 403, "COLLECTOR_INACTIVE");
		}
	}

	const passwordMatches = await bcrypt.compare(input.password, userRecord.passwordHash);

	if (!passwordMatches) {
		throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
	}

	await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userRecord.id));
	await db.insert(auditLogs).values({
		userId: userRecord.id,
		action: "user_login",
		entityType: "auth",
		entityId: userRecord.id,
		metadata: {
			email: userRecord.email,
			role: userRecord.role
		},
		ipAddress: null
	});

	const user = sanitizeUser(userRecord);

	return {
		user,
		tokens: buildTokens(user)
	};
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
	const userRecord = await findUserById(userId);

	if (!userRecord || !userRecord.isActive) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	return sanitizeUser(userRecord);
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
	const userRecord = await findUserById(userId);

	if (!userRecord || !userRecord.isActive) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	const validPassword = await bcrypt.compare(input.currentPassword, userRecord.passwordHash);

	if (!validPassword) {
		throw new AppError("Current password is incorrect", 400, "INVALID_PASSWORD");
	}

	const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

	await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResult> {
	const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload & {
		sub: string;
		email: string;
		role: string;
		tokenType?: string;
	};

	if (payload.tokenType && payload.tokenType !== "refresh") {
		throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
	}

	const userRecord = await findUserById(payload.sub);

	if (!userRecord || !userRecord.isActive) {
		throw new AppError("User not found", 404, "USER_NOT_FOUND");
	}

	const user = sanitizeUser(userRecord);

	return {
		user,
		tokens: buildTokens(user)
	};
}

export async function logout(): Promise<{ message: string }> {
	return {
		message: "Logged out successfully"
	};
}

export async function ensureDefaultRolesExist() {
	const defaultRoles = [
		{ name: "admin", description: "System administrator" },
		{ name: "finance_officer", description: "Finance officer with reporting privileges" },
		{ name: "collector", description: "Council revenue collector" }
	] as const;

	for (const role of defaultRoles) {
		await db.insert(roles).values(role).onConflictDoNothing({ target: roles.name });
	}
}
