import { z } from "zod";

export const payerIdParamSchema = z.object({
	id: z.string().uuid()
});

export const listPayersQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().optional(),
	wardId: z.string().uuid().optional()
});

export const createPayerSchema = z.object({
	fullName: z.string().min(1),
	businessName: z.string().optional(),
	nationalId: z.string().trim().min(6).max(20).regex(/^[A-Za-z0-9-]+$/).optional(),
	phoneNumber: z.string().trim().min(7).max(20).regex(/^[0-9+\s-]+$/).optional(),
	address: z.string().optional(),
	wardId: z.string().uuid().nullable().optional()
});

export const updatePayerSchema = z.object({
	fullName: z.string().min(1).optional(),
	businessName: z.string().optional().nullable(),
	nationalId: z.string().trim().min(6).max(20).regex(/^[A-Za-z0-9-]+$/).optional().nullable(),
	phoneNumber: z.string().trim().min(7).max(20).regex(/^[0-9+\s-]+$/).optional().nullable(),
	address: z.string().optional().nullable(),
	wardId: z.string().uuid().nullable().optional()
});
