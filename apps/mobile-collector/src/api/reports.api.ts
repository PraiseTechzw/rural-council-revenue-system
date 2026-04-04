import { apiClient } from "./client";

export type TodaySummary = {
	transactionCount: number;
	totalAmount: number;
};

export const reportsApi = {
	async getTodaySummary(): Promise<TodaySummary | null> {
		try {
			const response = await apiClient.get<TodaySummary>("/reports/today-summary");
			return response.data;
		} catch {
			return null;
		}
	}
};
