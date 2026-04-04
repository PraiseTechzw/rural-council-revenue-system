import { apiClient } from "./client";
import type { ApiResponse, RevenueSource } from "@/types/api";

export async function listRevenueSources(params: Record<string, string | number | undefined>) {
	const { data } = await apiClient.get<ApiResponse<RevenueSource[]>>("/revenue-sources", { params });
	return {
		rows: data.data ?? [],
		meta: data.meta
	};
}

export async function createRevenueSource(payload: { name: string; code: string; category: string; description?: string; isActive?: boolean }) {
	const { data } = await apiClient.post<ApiResponse<RevenueSource>>("/revenue-sources", payload);
	return data.data;
}

export async function updateRevenueSource(id: string, payload: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean }) {
	const { data } = await apiClient.patch<ApiResponse<RevenueSource>>(`/revenue-sources/${id}`, payload);
	return data.data;
}
