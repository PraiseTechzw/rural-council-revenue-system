import { paymentMethods, revenueSources } from "../constants/revenue-types";

export type RevenueSource = (typeof revenueSources)[number]["value"];
export type PaymentMethod = (typeof paymentMethods)[number]["value"];

export type PaymentFormInput = {
	payerName: string;
	payerReference?: string;
	revenueSource: RevenueSource;
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
