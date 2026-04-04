import { apiClient } from "./client";
import type { ApiResponse, Ward } from "@/types/api";

export async function listWards(params: Record<string, string | number | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Ward[]>>("/wards", { params });
	return {
		rows: data.data ?? [],
		meta: data.meta
	};
}

export async function createWard(payload: { name: string; code: string; description?: string }) {
	const { data } = await apiClient.post<ApiResponse<Ward>>("/wards", payload);
	return data.data;
}

export async function updateWard(id: string, payload: { name?: string; code?: string; description?: string | null }) {
	const { data } = await apiClient.patch<ApiResponse<Ward>>(`/wards/${id}`, payload);
	return data.data;
}
