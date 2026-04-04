import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { createWard, getWardById, listWards, updateWard } from "./wards.service";

export const listWardsHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listWards(req.query);
	return res.status(200).json(success("Wards fetched successfully", result.rows, result.meta));
});

export const getWardHandler = asyncHandler(async (req: Request, res: Response) => {
	const ward = await getWardById(req.params.id);
	return res.status(200).json(success("Ward fetched successfully", ward));
});

export const createWardHandler = asyncHandler(async (req: Request, res: Response) => {
	const ward = await createWard(req.body, req.user?.id ?? null);
	return res.status(201).json(success("Ward created successfully", ward));
});

export const updateWardHandler = asyncHandler(async (req: Request, res: Response) => {
	const ward = await updateWard(req.params.id, req.body, req.user?.id ?? null);
	return res.status(200).json(success("Ward updated successfully", ward));
});
