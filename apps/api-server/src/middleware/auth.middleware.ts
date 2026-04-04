import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../db";
import { roles } from "../db/schema/roles";
import { users } from "../db/schema/users";
import { AppError } from "./error.middleware";

export type AuthTokenPayload = JwtPayload & {
	sub: string;
	role: string;
	email: string;
	tokenType?: "access" | "refresh";
};

function getBearerToken(authorizationHeader?: string): string | null {
	if (!authorizationHeader) {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(" ");
	return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
	try {
		const token = getBearerToken(req.headers.authorization) ?? (req.cookies?.access_token as string | undefined) ?? null;

		if (!token) {
			throw new AppError("Authentication required", 401, "UNAUTHORIZED");
		}

		const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

		if (payload.tokenType && payload.tokenType !== "access") {
			throw new AppError("Invalid access token", 401, "UNAUTHORIZED");
		}

		const [userRecord] = await db
			.select({
				id: users.id,
				email: users.email,
				firstName: users.firstName,
				lastName: users.lastName,
				isActive: users.isActive,
				role: roles.name
			})
			.from(users)
			.innerJoin(roles, eq(users.roleId, roles.id))
			.where(eq(users.id, payload.sub))
			.limit(1);

		if (!userRecord || !userRecord.isActive) {
			throw new AppError("User is inactive or no longer exists", 401, "UNAUTHORIZED");
		}

		req.user = {
			id: userRecord.id,
			role: userRecord.role,
			email: userRecord.email,
			firstName: userRecord.firstName,
			lastName: userRecord.lastName
		};

		return next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(new AppError("Session expired. Please sign in again.", 401, "TOKEN_EXPIRED"));
		}

		if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
			return next(new AppError("Invalid authentication token", 401, "UNAUTHORIZED"));
		}

		return next(error instanceof Error ? error : new AppError("Authentication failed", 401, "UNAUTHORIZED"));
	}
};
