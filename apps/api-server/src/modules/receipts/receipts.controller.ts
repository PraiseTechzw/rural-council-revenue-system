import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { getReceiptById, getReceiptByNumber } from "./receipts.service";

export const getReceiptHandler = asyncHandler(async (req: Request, res: Response) => {
	const receipt = await getReceiptById(req.params.id);
	return res.status(200).json(success("Receipt fetched successfully", receipt));
});

export const getReceiptByNumberHandler = asyncHandler(async (req: Request, res: Response) => {
	const receipt = await getReceiptByNumber(req.params.receiptNumber);
	return res.status(200).json(success("Receipt fetched successfully", receipt));
});
