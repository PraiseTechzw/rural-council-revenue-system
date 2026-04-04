import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { error } from "../lib/api-response";
import { logger, logError } from "../config/logger";

export class AppError extends Error {
	statusCode: number;
	code?: string;
	details?: unknown;

	constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		this.name = "AppError";
	}
}

export function notFound(req: Request, res: Response) {
	return res.status(404).json(error(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
	if (err instanceof ZodError) {
		return res.status(400).json(
			error("Validation failed", {
				issues: err.flatten()
			})
		);
	}

	if (err instanceof AppError) {
		return res.status(err.statusCode).json(
			error(err.message, {
				code: err.code,
				details: err.details
			})
		);
	}

	const message = err instanceof Error ? err.message : "An unexpected error occurred";
	logError(err, { method: req.method, path: req.originalUrl });
	logger.error(message);

	return res.status(500).json(error(message));
}
