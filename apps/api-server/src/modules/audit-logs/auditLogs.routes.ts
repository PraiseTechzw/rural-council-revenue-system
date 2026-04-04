import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { getAuditLogsHandler } from "./auditLogs.controller";
import { z } from "zod";

export const auditLogsRouter = Router();

const auditQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	action: z.string().optional(),
	entityType: z.string().optional()
});

auditLogsRouter.get("/", requireRoles("admin", "finance_officer"), validateRequest(auditQuerySchema, "query"), getAuditLogsHandler);
