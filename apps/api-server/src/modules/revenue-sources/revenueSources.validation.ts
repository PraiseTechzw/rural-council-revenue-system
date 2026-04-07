import { z } from "zod";

export const revenueSourceIdParamSchema = z.object({
	id: z.string().uuid()
});

export const listRevenueSourcesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().optional(),
	category: z.string().optional(),
	isActive: z.coerce.boolean().optional()
});

export const createRevenueSourceSchema = z.object({
	name: z.string().trim().min(1),
	code: z.string().trim().min(1),
	category: z.enum(["shop_rental", "housing_stand", "mining_fee", "market_levy", "other"]),
	description: z.string().trim().optional(),
	isActive: z.boolean().default(true)
});

export const updateRevenueSourceSchema = z.object({
	name: z.string().trim().min(1).optional(),
	code: z.string().trim().min(1).optional(),
	category: z.enum(["shop_rental", "housing_stand", "mining_fee", "market_levy", "other"]).optional(),
	description: z.string().trim().optional().nullable(),
	isActive: z.boolean().optional()
}).refine((value) => Object.values(value).some((field) => field !== undefined), {
	message: "At least one field must be provided for update"
});
