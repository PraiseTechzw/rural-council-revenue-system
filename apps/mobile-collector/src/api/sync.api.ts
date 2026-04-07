import { paymentsApi } from "./payments.api";
import type { CreatePaymentResponse, LocalPaymentRecord } from "../types/payment.types";

export const syncApi = {
	async syncOne(payment: LocalPaymentRecord): Promise<CreatePaymentResponse> {
		return paymentsApi.createPayment({
			payerName: payment.payerName,
			payerReference: payment.payerReference,
			revenueSource: payment.revenueSource,
			revenueSourceId: payment.revenueSourceId,
			revenueSourceCategory: payment.revenueSourceCategory,
			amount: payment.amount,
			paymentMethod: payment.paymentMethod,
			paymentDate: payment.paymentDate,
			notes: payment.notes,
			collectorId: payment.collectorId,
			ward: payment.ward,
			offlineReferenceId: payment.offlineReferenceId
		});
	}
};
