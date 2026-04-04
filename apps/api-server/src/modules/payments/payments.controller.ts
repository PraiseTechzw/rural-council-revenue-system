import type { Request, Response } from "express";
import type { AuthUser } from "../auth/auth.types";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { AppError } from "../../middleware/error.middleware";
import { bulkSyncPayments } from "../sync/sync.service";
import { createPayment, getCollectorDailySummary, getPaymentById, listPayments } from "./payments.service";

export const createPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	const result = await createPayment(req.body, req.user as AuthUser);
	return res.status(result.duplicate ? 200 : 201).json(success(result.duplicate ? "Payment already exists" : "Payment created successfully", result.payment));
});

export const bulkSyncPaymentsHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	const result = await bulkSyncPayments(req.body.items, req.user as AuthUser);
	return res.status(200).json(success("Payments synced successfully", result.results, result.summary));
});

export const getPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
	const payment = await getPaymentById(req.params.id);
	return res.status(200).json(success("Payment fetched successfully", payment));
});

export const listPaymentsHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listPayments(req.query);
	return res.status(200).json(success("Payments fetched successfully", result.rows, result.meta));
});

export const dailySummaryHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await getCollectorDailySummary(req.query);
	return res.status(200).json(success("Daily payment summary fetched successfully", result));
});
