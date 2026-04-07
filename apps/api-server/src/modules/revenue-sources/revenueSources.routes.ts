import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createRevenueSourceHandler, getRevenueSourceHandler, listRevenueSourcesHandler, updateRevenueSourceHandler } from "./revenueSources.controller";
import { createRevenueSourceSchema, listRevenueSourcesQuerySchema, revenueSourceIdParamSchema, updateRevenueSourceSchema } from "./revenueSources.validation";

export const revenueSourcesRouter = Router();

revenueSourcesRouter.get("/", requireRoles("admin", "finance_officer", "collector"), validateRequest(listRevenueSourcesQuerySchema, "query"), listRevenueSourcesHandler);
revenueSourcesRouter.post("/", requireRoles("admin"), validateRequest(createRevenueSourceSchema, "body"), createRevenueSourceHandler);
revenueSourcesRouter.get("/:id", requireRoles("admin", "finance_officer", "collector"), validateRequest(revenueSourceIdParamSchema, "params"), getRevenueSourceHandler);
revenueSourcesRouter.patch("/:id", requireRoles("admin"), validateRequest(revenueSourceIdParamSchema, "params"), validateRequest(updateRevenueSourceSchema, "body"), updateRevenueSourceHandler);
