import { apiClient } from "./client";
import type { CollectorUser, LoginPayload, LoginResponse } from "../types/auth.types";

type BackendAuthUser = {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	role?: string;
	collectorStatus?: "active" | "inactive" | null;
	wardId?: string | null;
	wardName?: string | null;
};

type ApiEnvelope<T> = {
	success: boolean;
	message: string;
	data?: T;
};

type LoginData = {
	user?: BackendAuthUser;
	tokens?: {
		accessToken?: string;
	};
};

type MeData = BackendAuthUser;

function mapUser(user?: BackendAuthUser): CollectorUser | undefined {
	if (!user) {
		return undefined;
	}

	const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

	return {
		id: user.id,
		name: fullName || "Collector",
		email: user.email,
		role: user.role ?? "collector",
		assignedWard: user.wardName ?? undefined,
		wardId: user.wardId ?? undefined,
		collectorStatus: user.collectorStatus ?? undefined
	};
}

export const authApi = {
	async login(payload: LoginPayload): Promise<LoginResponse> {
		const response = await apiClient.post<ApiEnvelope<LoginData>>("/auth/login", payload);
		const accessToken = response.data?.data?.tokens?.accessToken;

		if (!accessToken || typeof accessToken !== "string") {
			throw new Error("Login response missing access token.");
		}

		return {
			accessToken,
			user: mapUser(response.data?.data?.user)
		};
	},

	async me(): Promise<CollectorUser> {
		const response = await apiClient.get<ApiEnvelope<MeData>>("/auth/me");
		const user = mapUser(response.data?.data);

		if (!user) {
			throw new Error("Invalid profile response from server.");
		}

		return user;
	}
};
