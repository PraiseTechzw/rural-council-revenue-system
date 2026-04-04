import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { dailyReportHandler, monthlyReportHandler, revenueByCollectorHandler, revenueBySourceHandler, revenueByWardHandler } from "./reports.controller";
import { z } from "zod";

export const reportsRouter = Router();

const dailyQuerySchema = z.object({
	date: z.string().optional(),
	collectorId: z.string().uuid().optional(),
	revenueSourceId: z.string().uuid().optional(),
	wardId: z.string().uuid().optional()
});

const monthlyQuerySchema = z.object({
	month: z.string().optional(),
	collectorId: z.string().uuid().optional(),
	revenueSourceId: z.string().uuid().optional(),
	wardId: z.string().uuid().optional()
});

const rangeQuerySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional()
});

reportsRouter.get("/daily", requireRoles("admin", "finance_officer"), validateRequest(dailyQuerySchema, "query"), dailyReportHandler);
reportsRouter.get("/monthly", requireRoles("admin", "finance_officer"), validateRequest(monthlyQuerySchema, "query"), monthlyReportHandler);
reportsRouter.get("/by-source", requireRoles("admin", "finance_officer"), validateRequest(rangeQuerySchema, "query"), revenueBySourceHandler);
reportsRouter.get("/by-collector", requireRoles("admin", "finance_officer"), validateRequest(rangeQuerySchema, "query"), revenueByCollectorHandler);
reportsRouter.get("/by-ward", requireRoles("admin", "finance_officer"), validateRequest(rangeQuerySchema, "query"), revenueByWardHandler);
