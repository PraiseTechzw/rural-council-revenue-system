import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "./error.middleware";

type ValidationSource = "body" | "query" | "params";

export function validateRequest<T extends ZodTypeAny>(schema: T, source: ValidationSource = "body"): RequestHandler {
	return (req, _res, next) => {
		const parsed = schema.safeParse(req[source]);

		if (!parsed.success) {
			return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten()));
		}

		(req as unknown as Record<string, unknown>)[source] = parsed.data;
		return next();
	};
}
