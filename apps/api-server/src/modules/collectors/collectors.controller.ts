import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { AppError } from "../../middleware/error.middleware";
import { createCollector, getCollectorById, getCollectorByUserId, listCollectors, updateCollector } from "./collectors.service";

export const listCollectorsHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listCollectors(req.query);
	return res.status(200).json(success("Collectors fetched successfully", result.rows, result.meta));
});

export const getCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
	const collector = await getCollectorById(req.params.id);
	return res.status(200).json(success("Collector fetched successfully", collector));
});

export const getCurrentCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	const collector = await getCollectorByUserId(req.user.id);
	return res.status(200).json(success("Collector fetched successfully", collector));
});

export const createCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
	const collector = await createCollector(req.body, req.user!.id);
	return res.status(201).json(success("Collector created successfully", collector));
});

export const updateCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
	const collector = await updateCollector(req.params.id, req.body, req.user!.id);
	return res.status(200).json(success("Collector updated successfully", collector));
});
