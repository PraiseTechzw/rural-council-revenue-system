export type PaymentMethod = "cash" | "mobile_money" | "bank" | "other";
export type PaymentStatus = "pending" | "posted" | "voided" | "reversed";
export type SyncStatus = "pending" | "synced" | "failed" | "duplicate";

export type CreatePaymentInput = {
	payerId: string;
	collectorId: string;
	revenueSourceId: string;
	wardId?: string | null;
	amount: number;
	currency?: string;
	paymentMethod: PaymentMethod;
	paymentDate: string;
	notes?: string | null;
	offlineReferenceId?: string | null;
	syncStatus?: SyncStatus;
	status?: PaymentStatus;
};

export type PaymentFilterInput = {
	page?: number | string;
	limit?: number | string;
	startDate?: string;
	endDate?: string;
	collectorId?: string;
	revenueSourceId?: string;
	wardId?: string;
	paymentMethod?: PaymentMethod;
	status?: PaymentStatus;
	search?: string;
};

export type DailySummaryFilterInput = {
	date?: string;
	collectorId?: string;
	revenueSourceId?: string;
	wardId?: string;
};
