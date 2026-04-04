import { apiClient } from "./client";
import type { ApiResponse, Collector } from "@/types/api";

export async function listCollectors(params: Record<string, string | number | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Collector[]>>("/collectors", { params });
	return {
		rows: data.data ?? [],
		meta: data.meta
	};
}

export async function createCollector(payload: { userId: string; wardId?: string | null; employeeNumber?: string; status?: "active" | "inactive" }) {
	const { data } = await apiClient.post<ApiResponse<Collector>>("/collectors", payload);
	return data.data;
}

export async function updateCollector(id: string, payload: { wardId?: string | null; employeeNumber?: string | null; status?: "active" | "inactive" }) {
	const { data } = await apiClient.patch<ApiResponse<Collector>>(`/collectors/${id}`, payload);
	return data.data;
}
