import { apiClient } from "./client";
import type { ApiResponse, AuthUser, LoginPayload, LoginResult } from "@/types/api";

export async function login(payload: LoginPayload): Promise<LoginResult> {
	const { data } = await apiClient.post<ApiResponse<LoginResult>>("/auth/login", payload);

	if (!data.success || !data.data) {
		throw new Error(data.message || "Login failed");
	}

	return data.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
	const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");

	if (!data.success || !data.data) {
		throw new Error(data.message || "Unable to fetch current user");
	}

	return data.data;
}

export async function logout(): Promise<void> {
	await apiClient.post("/auth/logout");
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
	await apiClient.post("/auth/change-password", payload);
}
