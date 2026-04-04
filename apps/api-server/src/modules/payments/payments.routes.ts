import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { bulkSyncPaymentsHandler, createPaymentHandler, dailySummaryHandler, getPaymentHandler, listPaymentsHandler } from "./payments.controller";
import { bulkSyncPaymentSchema, createPaymentSchema, paymentIdParamSchema, paymentListQuerySchema, paymentSummaryDailyQuerySchema } from "./payments.validation";

export const paymentsRouter = Router();

paymentsRouter.post("/", requireRoles("admin", "finance_officer", "collector"), validateRequest(createPaymentSchema, "body"), createPaymentHandler);
paymentsRouter.get("/", requireRoles("admin", "finance_officer", "collector"), validateRequest(paymentListQuerySchema, "query"), listPaymentsHandler);
paymentsRouter.get("/summary/daily", requireRoles("admin", "finance_officer"), validateRequest(paymentSummaryDailyQuerySchema, "query"), dailySummaryHandler);
paymentsRouter.get("/:id", requireRoles("admin", "finance_officer", "collector"), validateRequest(paymentIdParamSchema, "params"), getPaymentHandler);
paymentsRouter.post("/sync/bulk", requireRoles("admin", "finance_officer", "collector"), validateRequest(bulkSyncPaymentSchema, "body"), bulkSyncPaymentsHandler);
