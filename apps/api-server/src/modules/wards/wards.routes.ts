import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createWardHandler, getWardHandler, listWardsHandler, updateWardHandler } from "./wards.controller";
import { createWardSchema, listWardsQuerySchema, updateWardSchema, wardIdParamSchema } from "./wards.validation";

export const wardsRouter = Router();

wardsRouter.get("/", requireRoles("admin", "finance_officer"), validateRequest(listWardsQuerySchema, "query"), listWardsHandler);
wardsRouter.post("/", requireRoles("admin"), validateRequest(createWardSchema, "body"), createWardHandler);
wardsRouter.get("/:id", requireRoles("admin", "finance_officer"), validateRequest(wardIdParamSchema, "params"), getWardHandler);
wardsRouter.patch("/:id", requireRoles("admin"), validateRequest(wardIdParamSchema, "params"), validateRequest(updateWardSchema, "body"), updateWardHandler);
