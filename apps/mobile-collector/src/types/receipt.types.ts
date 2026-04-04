export type ReceiptView = {
	paymentId?: string;
	localId?: string;
	receiptNumber: string;
	payerName: string;
	revenueSource: string;
	amount: number;
	paymentMethod: string;
	collectorName?: string;
	paymentDate: string;
	ward?: string;
	notes?: string;
	syncStatus: "pending" | "synced" | "failed";
};
