import type { Request, Response } from "express";
import type { AuthUser } from "../auth/auth.types";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { AppError } from "../../middleware/error.middleware";
import { bulkSyncPayments, listSyncLogs } from "./sync.service";

export const bulkSyncPaymentsHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	const result = await bulkSyncPayments(req.body.items, req.user as AuthUser);
	return res.status(200).json(success("Payments synced successfully", result.results, result.summary));
});

export const listSyncLogsHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listSyncLogs(req.query);
	return res.status(200).json(success("Sync logs fetched successfully", result.rows, result.meta));
});
