import { apiClient } from "./client";
import type { CollectorUser, LoginPayload, LoginResponse } from "../types/auth.types";

type MeResponse = {
	user?: CollectorUser;
} & Partial<CollectorUser>;

export const authApi = {
	async login(payload: LoginPayload): Promise<LoginResponse> {
		const response = await apiClient.post<LoginResponse>("/auth/login", payload);
		return response.data;
	},

	async me(): Promise<CollectorUser> {
		const response = await apiClient.get<MeResponse>("/auth/me");
		const data = response.data;

		if (data.user) {
			return data.user;
		}

		return {
			id: data.id ?? "unknown",
			name: data.name ?? "Collector",
			email: data.email,
			role: data.role ?? "collector",
			assignedWard: data.assignedWard
		};
	}
};
