import { apiClient } from "./client";
import type { CreatePaymentResponse, LocalPaymentRecord, PaymentPayload } from "../types/payment.types";

type ListPaymentsResponse = {
	items?: Array<Partial<LocalPaymentRecord>>;
};

export const paymentsApi = {
	async createPayment(payload: PaymentPayload): Promise<CreatePaymentResponse> {
		const response = await apiClient.post<CreatePaymentResponse>("/payments", {
			...payload,
			offline_reference_id: payload.offlineReferenceId
		});
		return response.data;
	},

	async listPayments(): Promise<Array<Partial<LocalPaymentRecord>>> {
		const response = await apiClient.get<ListPaymentsResponse | Array<Partial<LocalPaymentRecord>>>("/payments");
		if (Array.isArray(response.data)) {
			return response.data;
		}

		return response.data.items ?? [];
	}
};
