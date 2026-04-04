import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { createPayer, getPayerById, listPayers, updatePayer } from "./payers.service";

export const listPayersHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listPayers(req.query);
	return res.status(200).json(success("Payers fetched successfully", result.rows, result.meta));
});

export const getPayerHandler = asyncHandler(async (req: Request, res: Response) => {
	const payer = await getPayerById(req.params.id);
	return res.status(200).json(success("Payer fetched successfully", payer));
});

export const createPayerHandler = asyncHandler(async (req: Request, res: Response) => {
	const payer = await createPayer(req.body, req.user!.id);
	return res.status(201).json(success("Payer created successfully", payer));
});

export const updatePayerHandler = asyncHandler(async (req: Request, res: Response) => {
	const payer = await updatePayer(req.params.id, req.body, req.user!.id);
	return res.status(200).json(success("Payer updated successfully", payer));
});
