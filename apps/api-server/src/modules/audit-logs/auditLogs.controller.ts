import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { listAuditLogs } from "./auditLogs.service";

export const getAuditLogsHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listAuditLogs(req.query);
	return res.status(200).json(success("Audit logs fetched successfully", result.rows, result.meta));
});
