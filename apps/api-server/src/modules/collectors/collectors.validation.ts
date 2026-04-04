import { z } from "zod";

export const collectorIdParamSchema = z.object({
	id: z.string().uuid()
});

export const listCollectorsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().optional(),
	status: z.enum(["active", "inactive"]).optional(),
	wardId: z.string().uuid().optional()
});

export const createCollectorSchema = z.object({
	userId: z.string().uuid(),
	wardId: z.string().uuid().nullable().optional(),
	employeeNumber: z.string().min(1).optional(),
	status: z.enum(["active", "inactive"]).default("active")
});

export const updateCollectorSchema = z.object({
	wardId: z.string().uuid().nullable().optional(),
	employeeNumber: z.string().min(1).optional().nullable(),
	status: z.enum(["active", "inactive"]).optional()
});
