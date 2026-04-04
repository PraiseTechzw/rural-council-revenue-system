import { z } from "zod";

export const paymentIdParamSchema = z.object({
	id: z.string().uuid()
});

export const paymentListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	collectorId: z.string().uuid().optional(),
	revenueSourceId: z.string().uuid().optional(),
	wardId: z.string().uuid().optional(),
	paymentMethod: z.enum(["cash", "mobile_money", "bank", "other"]).optional(),
	status: z.enum(["pending", "posted", "voided", "reversed"]).optional(),
	search: z.string().optional()
});

export const paymentSummaryDailyQuerySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
	collectorId: z.string().uuid().optional(),
	revenueSourceId: z.string().uuid().optional(),
	wardId: z.string().uuid().optional()
});

export const createPaymentSchema = z.object({
	payerId: z.string().uuid(),
	collectorId: z.string().uuid(),
	revenueSourceId: z.string().uuid(),
	wardId: z.string().uuid().nullable().optional(),
	amount: z.coerce.number().positive(),
	currency: z.string().min(3).max(3).optional(),
	paymentMethod: z.enum(["cash", "mobile_money", "bank", "other"]),
	paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	notes: z.string().optional().nullable(),
	offlineReferenceId: z.string().min(1).optional().nullable()
});

export const bulkSyncPaymentItemSchema = createPaymentSchema.extend({
	offlineReferenceId: z.string().min(1)
});

export const bulkSyncPaymentSchema = z.object({
	items: z.array(bulkSyncPaymentItemSchema).min(1).max(100)
});
