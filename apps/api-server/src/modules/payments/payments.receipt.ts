import type { Payment } from "../../db/schema/payments";

export type PrintableReceipt = {
	receiptNumber: string;
	receiptId?: string;
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
	issuedAt?: Date;
};

export function toPrintableReceipt(payment: {
	paymentId: string;
	receiptId?: string;
	receiptNumber: string;
	payerName: string;
	collectorFirstName: string;
	collectorLastName: string;
	revenueSourceName: string;
	wardName: string | null;
	amount: string;
	currency: string;
	paymentMethod: string;
	paymentDate: Date;
	notes: string | null;
	issuedAt?: Date | null;
}): PrintableReceipt {
	return {
		receiptNumber: payment.receiptNumber,
		receiptId: payment.receiptId,
		paymentId: payment.paymentId,
		payerName: payment.payerName,
		collectorName: `${payment.collectorFirstName} ${payment.collectorLastName}`.trim(),
		revenueSourceName: payment.revenueSourceName,
		wardName: payment.wardName,
		amount: payment.amount,
		currency: payment.currency,
		paymentMethod: payment.paymentMethod,
		paymentDate: payment.paymentDate.toISOString().slice(0, 10),
		notes: payment.notes,
		issuedAt: payment.issuedAt ?? undefined
	};
}

export function makeReceiptPayload(payment: Payment, receiptNumber: string) {
	return {
		paymentId: payment.id,
		receiptNumber,
		paymentDate: payment.paymentDate,
		amount: payment.amount,
		currency: payment.currency,
		paymentMethod: payment.paymentMethod,
		notes: payment.notes ?? null
	};
}
