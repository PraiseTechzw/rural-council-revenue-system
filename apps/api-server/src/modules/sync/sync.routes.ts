import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { listSyncLogsHandler } from "./sync.controller";
import { syncLogQuerySchema } from "./sync.validation";

export const syncRouter = Router();

syncRouter.get("/logs", requireRoles("admin", "finance_officer"), validateRequest(syncLogQuerySchema, "query"), listSyncLogsHandler);
