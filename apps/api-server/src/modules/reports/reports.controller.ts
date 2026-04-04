import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { dailyReport, monthlyReport, revenueByCollectorReport, revenueBySourceReport, revenueByWardReport } from "./reports.service";

export const dailyReportHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await dailyReport(req.query);
	return res.status(200).json(success("Daily report fetched successfully", result));
});

export const monthlyReportHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await monthlyReport(req.query);
	return res.status(200).json(success("Monthly report fetched successfully", result));
});

export const revenueBySourceHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await revenueBySourceReport(req.query);
	return res.status(200).json(success("Revenue by source fetched successfully", result.rows));
});

export const revenueByCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await revenueByCollectorReport(req.query);
	return res.status(200).json(success("Revenue by collector fetched successfully", result.rows));
});

export const revenueByWardHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await revenueByWardReport(req.query);
	return res.status(200).json(success("Revenue by ward fetched successfully", result.rows));
});
