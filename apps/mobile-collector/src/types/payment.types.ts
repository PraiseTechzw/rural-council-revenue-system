import { paymentMethods } from "../constants/revenue-types";

export type PaymentMethod = (typeof paymentMethods)[number]["value"];

export type PaymentFormInput = {
	payerName: string;
	payerReference?: string;
	revenueSource: string;
	revenueSourceId?: string;
	revenueSourceCategory?: string;
	amount: number;
	paymentMethod: PaymentMethod;
	paymentDate: string;
	notes?: string;
};

export type PaymentPayload = PaymentFormInput & {
	collectorId?: string;
	ward?: string;
	offlineReferenceId: string;
};

export type SyncStatus = "pending" | "synced" | "failed";

export type LocalPaymentRecord = PaymentPayload & {
	localId: string;
	createdAt: string;
	updatedAt: string;
	syncStatus: SyncStatus;
	syncError?: string;
	serverPaymentId?: string;
	receiptNumber?: string;
};

export type CreatePaymentResponse = {
	id: string;
	receiptNumber?: string;
	createdAt?: string;
};
