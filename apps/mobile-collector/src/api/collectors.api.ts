import { apiClient } from "./client";

type CollectorProfile = {
	id: string;
	userId: string;
	wardId?: string | null;
	wardName?: string | null;
	status?: "active" | "inactive";
};

type ApiEnvelope<T> = {
	success: boolean;
	message: string;
	data?: T;
};

export const collectorsApi = {
	async me(): Promise<CollectorProfile> {
		const response = await apiClient.get<ApiEnvelope<CollectorProfile>>("/collectors/me");
		const profile = response.data?.data;

		if (!profile) {
			throw new Error("Invalid collector profile response from server.");
		}

		return profile;
	}
};
