import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export async function getDailyReport(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>("/reports/daily", { params });
	return data.data;
}

export async function getMonthlyReport(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>("/reports/monthly", { params });
	return data.data;
}

export async function getRevenueBySource(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/reports/by-source", { params });
	return data.data ?? [];
}

export async function getRevenueByCollector(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/reports/by-collector", { params });
	return data.data ?? [];
}

export async function getRevenueByWard(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/reports/by-ward", { params });
	return data.data ?? [];
}
