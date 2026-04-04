import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createPayerHandler, getPayerHandler, listPayersHandler, updatePayerHandler } from "./payers.controller";
import { createPayerSchema, listPayersQuerySchema, payerIdParamSchema, updatePayerSchema } from "./payers.validation";

export const payersRouter = Router();

payersRouter.get("/", requireRoles("admin", "finance_officer", "collector"), validateRequest(listPayersQuerySchema, "query"), listPayersHandler);
payersRouter.post("/", requireRoles("admin", "finance_officer", "collector"), validateRequest(createPayerSchema, "body"), createPayerHandler);
payersRouter.get("/:id", requireRoles("admin", "finance_officer", "collector"), validateRequest(payerIdParamSchema, "params"), getPayerHandler);
payersRouter.patch("/:id", requireRoles("admin", "finance_officer"), validateRequest(payerIdParamSchema, "params"), validateRequest(updatePayerSchema, "body"), updatePayerHandler);
