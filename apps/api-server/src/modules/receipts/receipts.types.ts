export type ReceiptView = {
	id: string;
	receiptNumber: string;
	paymentId: string;
	payerName: string;
	collectorName: string;
	revenueSourceName: string;
	wardName: string | null;
	amount: string;
	currency: string;
	paymentMethod: string;
	paymentDate: string;
	notes: string | null;
	issuedAt: string;
};
