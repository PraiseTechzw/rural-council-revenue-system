import { apiClient } from "./client";
import type { ReceiptView } from "../types/receipt.types";

export const receiptsApi = {
	async getByPaymentId(paymentId: string): Promise<ReceiptView> {
		const response = await apiClient.get<ReceiptView>(`/payments/${paymentId}/receipt`);
		return response.data;
	}
};
