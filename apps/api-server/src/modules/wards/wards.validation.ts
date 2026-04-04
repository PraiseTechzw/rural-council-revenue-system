import { z } from "zod";

export const wardIdParamSchema = z.object({
	id: z.string().uuid()
});

export const listWardsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().optional()
});

export const createWardSchema = z.object({
	name: z.string().min(1),
	code: z.string().min(1),
	description: z.string().optional()
});

export const updateWardSchema = z.object({
	name: z.string().min(1).optional(),
	code: z.string().min(1).optional(),
	description: z.string().optional().nullable()
});
