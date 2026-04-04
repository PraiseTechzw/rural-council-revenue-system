import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters")
});

export const paymentSchema = z.object({
	payerName: z.string().min(2, "Payer name is required"),
	payerReference: z.string().optional(),
	revenueSource: z.enum([
		"shop_rental",
		"housing_stand",
		"mining_fee",
		"market_levy",
		"other"
	]),
	amount: z.coerce.number().positive("Amount must be greater than zero"),
	paymentMethod: z.enum(["cash", "mobile_money", "bank", "other"]),
	paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be YYYY-MM-DD"),
	notes: z.string().max(500, "Notes are too long").optional()
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type PaymentSchemaInput = z.infer<typeof paymentSchema>;
