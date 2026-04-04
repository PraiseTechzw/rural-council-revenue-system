import type { RequestHandler } from "express";

export function auditMiddleware(action: string, entityType: string): RequestHandler {
	return (req, _res, next) => {
		req.auditContext = {
			action,
			entityType,
			entityId: typeof req.params?.id === "string" ? req.params.id : undefined,
			metadata: {}
		};

		return next();
	};
}

export function withAuditMetadata(metadata: Record<string, unknown>): RequestHandler {
	return (req, _res, next) => {
		req.auditContext = {
			...(req.auditContext ?? { action: "unknown", entityType: "unknown" }),
			metadata
		};

		return next();
	};
}
