import type { RequestHandler } from "express";
import { AppError } from "./error.middleware";

export function requireRoles(...allowedRoles: string[]): RequestHandler {
	return (req, _res, next) => {
		if (!req.user) {
			return next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
		}

		return next();
	};
}
