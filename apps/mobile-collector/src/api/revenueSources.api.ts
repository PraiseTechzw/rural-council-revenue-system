import { apiClient } from "./client";

type ApiResponse<T> = {
	success?: boolean;
	message?: string;
	data?: T;
};

export type MobileRevenueSource = {
	id: string;
	name: string;
	code: string;
	category: string;
	description: string | null;
	isActive: boolean;
};

export const revenueSourcesApi = {
	async listActive() {
		const response = await apiClient.get<ApiResponse<MobileRevenueSource[]>>("/revenue-sources", {
			params: {
				page: 1,
				limit: 100,
				isActive: true
			}
		});

		return response.data.data ?? [];
	}
};
