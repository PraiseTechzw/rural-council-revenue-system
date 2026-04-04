import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters")
});

export const paymentSchema = z.object({
	payerName: z.string().min(2, "Payer name is required"),
	payerReference: z.string().optional(),
	revenueSource: z.enum([
		"shop_rentals",
		"housing_stands",
		"mining_fees",
		"market_levies",
		"other_council_charges"
	]),
	amount: z.coerce.number().positive("Amount must be greater than zero"),
	paymentMethod: z.enum(["cash", "mobile_money", "bank_transfer", "pos"]),
	paymentDate: z.string().min(4, "Payment date is required"),
	notes: z.string().max(500, "Notes are too long").optional()
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type PaymentSchemaInput = z.infer<typeof paymentSchema>;
