import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { createRevenueSource, getRevenueSourceById, listRevenueSources, updateRevenueSource } from "./revenueSources.service";

export const listRevenueSourcesHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listRevenueSources(req.query);
	return res.status(200).json(success("Revenue sources fetched successfully", result.rows, result.meta));
});

export const getRevenueSourceHandler = asyncHandler(async (req: Request, res: Response) => {
	const row = await getRevenueSourceById(req.params.id);
	return res.status(200).json(success("Revenue source fetched successfully", row));
});

export const createRevenueSourceHandler = asyncHandler(async (req: Request, res: Response) => {
	const row = await createRevenueSource(req.body, req.user!.id);
	return res.status(201).json(success("Revenue source created successfully", row));
});

export const updateRevenueSourceHandler = asyncHandler(async (req: Request, res: Response) => {
	const row = await updateRevenueSource(req.params.id, req.body, req.user!.id);
	return res.status(200).json(success("Revenue source updated successfully", row));
});
