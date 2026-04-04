import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { createUser, getUserById, listUsers, updateUser } from "./users.service";

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await listUsers(req.query);
	return res.status(200).json(success("Users fetched successfully", result.rows, result.meta));
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
	const user = await getUserById(req.params.id);
	return res.status(200).json(success("User fetched successfully", user));
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
	const user = await createUser(req.body, req.user!.id);
	return res.status(201).json(success("User created successfully", user));
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
	const user = await updateUser(req.params.id, req.body, req.user!.id);
	return res.status(200).json(success("User updated successfully", user));
});
