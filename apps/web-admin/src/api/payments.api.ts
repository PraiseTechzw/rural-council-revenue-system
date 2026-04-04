import { apiClient } from "./client";
import type { ApiResponse, PaymentRecord } from "@/types/api";

type PaymentListResult = {
	rows: PaymentRecord[];
	meta?: ApiResponse<PaymentRecord[]>["meta"];
};

export async function listPayments(params: Record<string, string | number | boolean | undefined>) {
	const { data } = await apiClient.get<ApiResponse<PaymentRecord[]>>("/payments", { params });
	return {
		rows: data.data ?? [],
		meta: data.meta
	} satisfies PaymentListResult;
}

export async function createPayment(payload: {
	payerName: string;
	revenueSourceCategory: string;
	amount: number;
	paymentMethod: string;
	paymentDate: string;
	notes?: string;
	collectorId: string;
	offlineReferenceId?: string;
	wardId?: string | null;
}) {
	const { data } = await apiClient.post<ApiResponse<PaymentRecord>>("/payments", payload);

	if (!data.success || !data.data) {
		throw new Error(data.message || "Failed to create payment");
	}

	return data.data;
}

export async function getPaymentById(id: string) {
	const { data } = await apiClient.get<ApiResponse<PaymentRecord>>(`/payments/${id}`);

	if (!data.success || !data.data) {
		throw new Error(data.message || "Payment not found");
	}

	return data.data;
}

export async function getDailySummary(params: Record<string, string | undefined>) {
	const { data } = await apiClient.get<ApiResponse<{ date: string; paymentCount: number; totalAmount: number }>>("/payments/summary/daily", { params });

	if (!data.success || !data.data) {
		throw new Error(data.message || "Unable to fetch daily summary");
	}

	return data.data;
}
