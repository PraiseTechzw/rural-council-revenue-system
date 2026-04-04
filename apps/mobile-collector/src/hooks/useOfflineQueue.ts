import { useMemo } from "react";

import type { CreatePaymentResponse, PaymentPayload } from "../types/payment.types";
import { usePaymentStore } from "../store/payment.store";

export function useOfflineQueue() {
	const transactions = usePaymentStore((state) => state.transactions);
	const addPending = usePaymentStore((state) => state.addPending);
	const addSynced = usePaymentStore((state) => state.addSynced);
	const markSynced = usePaymentStore((state) => state.markSynced);
	const markFailed = usePaymentStore((state) => state.markFailed);

	const pendingPayments = useMemo(
		() => transactions.filter((item) => item.syncStatus === "pending" || item.syncStatus === "failed"),
		[transactions]
	);

	return {
		transactions,
		pendingPayments,
		pendingCount: pendingPayments.length,
		enqueuePayment: (payload: PaymentPayload) => addPending(payload),
		addSyncedPayment: (payload: PaymentPayload, response: CreatePaymentResponse) => addSynced(payload, response),
		markSynced,
		markFailed
	};
}
