import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { getReceiptByNumberHandler, getReceiptHandler } from "./receipts.controller";
import { z } from "zod";

export const receiptsRouter = Router();

const receiptIdSchema = z.object({ id: z.string().uuid() });
const receiptNumberSchema = z.object({ receiptNumber: z.string().min(1) });

receiptsRouter.get("/number/:receiptNumber", requireRoles("admin", "finance_officer", "collector"), validateRequest(receiptNumberSchema, "params"), getReceiptByNumberHandler);
receiptsRouter.get("/:id", requireRoles("admin", "finance_officer", "collector"), validateRequest(receiptIdSchema, "params"), getReceiptHandler);
