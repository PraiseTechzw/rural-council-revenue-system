import type { Request, Response } from "express";
import { success } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { AppError } from "../../middleware/error.middleware";
import { env } from "../../config/env";
import { changePassword, getCurrentUser, login, logout, refreshAccessToken } from "./auth.service";

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
	const result = await login(req.body);

	res.cookie("refresh_token", result.tokens.refreshToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 1000 * 60 * 60 * 24 * 7
	});

	return res.status(200).json(success("Login successful", result));
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	const user = await getCurrentUser(req.user.id);
	return res.status(200).json(success("Current user fetched successfully", user));
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required", 401, "UNAUTHORIZED");
	}

	await changePassword(req.user.id, req.body);
	return res.status(200).json(success("Password changed successfully"));
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
	const refreshToken = (req.body?.refreshToken as string | undefined) ?? (req.cookies?.refresh_token as string | undefined);

	if (!refreshToken) {
		throw new AppError("Refresh token is required", 401, "UNAUTHORIZED");
	}

	const result = await refreshAccessToken(refreshToken);

	res.cookie("refresh_token", result.tokens.refreshToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 1000 * 60 * 60 * 24 * 7
	});

	return res.status(200).json(success("Token refreshed successfully", result));
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
	const result = await logout();

	res.clearCookie("refresh_token");
	return res.status(200).json(success(result.message));
});
