import { apiClient } from "./client";
import type { CreatePaymentResponse, LocalPaymentRecord, PaymentPayload } from "../types/payment.types";

function mapPaymentMethod(paymentMethod: string) {
	if (paymentMethod === "bank_transfer") {
		return "bank";
	}

	if (paymentMethod === "pos") {
		return "other";
	}

	return paymentMethod;
}

type ListPaymentsResponse = {
	items?: Array<Partial<LocalPaymentRecord>>;
};

export const paymentsApi = {
	async createPayment(payload: PaymentPayload): Promise<CreatePaymentResponse> {
		const response = await apiClient.post<CreatePaymentResponse>("/payments", {
			payerName: payload.payerName,
			payerReference: payload.payerReference,
			revenueSourceCategory: payload.revenueSource,
			amount: payload.amount,
			paymentMethod: mapPaymentMethod(payload.paymentMethod),
			paymentDate: payload.paymentDate.slice(0, 10),
			notes: payload.notes,
			offlineReferenceId: payload.offlineReferenceId
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
