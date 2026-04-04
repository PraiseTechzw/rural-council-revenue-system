import { z } from "zod";

export const syncLogQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional()
});

export const bulkSyncPaymentItemSchema = z.object({
	payerId: z.string().uuid(),
	collectorId: z.string().uuid(),
	revenueSourceId: z.string().uuid(),
	wardId: z.string().uuid().nullable().optional(),
	amount: z.coerce.number().positive(),
	currency: z.string().min(3).max(3).optional(),
	paymentMethod: z.enum(["cash", "mobile_money", "bank", "other"]),
	paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	notes: z.string().optional().nullable(),
	offlineReferenceId: z.string().min(1)
});

export const bulkSyncPaymentsSchema = z.object({
	items: z.array(bulkSyncPaymentItemSchema).min(1)
});
