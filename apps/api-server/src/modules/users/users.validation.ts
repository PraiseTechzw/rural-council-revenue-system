import { z } from "zod";

export const userIdParamSchema = z.object({
	id: z.string().uuid()
});

export const listUsersQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	search: z.string().optional(),
	roleName: z.enum(["admin", "finance_officer", "collector"]).optional(),
	isActive: z.coerce.boolean().optional()
});

export const createUserSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phoneNumber: z.string().min(6).optional(),
	password: z.string().min(8),
	roleName: z.enum(["admin", "finance_officer", "collector"])
});

export const updateUserSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phoneNumber: z.string().min(6).nullable().optional(),
	isActive: z.boolean().optional(),
	roleName: z.enum(["admin", "finance_officer", "collector"]).optional()
});
