import { eq } from "drizzle-orm";
import { db } from "../../db";
import { receipts } from "../../db/schema/receipts";
import { getPaymentById } from "../payments/payments.service";
import { AppError } from "../../middleware/error.middleware";

export async function getReceiptById(id: string) {
	const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);

	if (!receipt) {
		throw new AppError("Receipt not found", 404, "RECEIPT_NOT_FOUND");
	}

	const payment = await getPaymentById(receipt.paymentId);

	return {
		id: receipt.id,
		receiptNumber: receipt.receiptNumber,
		paymentId: receipt.paymentId,
		payerName: payment.payer.name,
		collectorName: `${payment.collector.firstName} ${payment.collector.lastName}`.trim(),
		revenueSourceName: payment.revenueSource.name,
		wardName: payment.ward?.name ?? null,
		amount: payment.amount,
		currency: payment.currency,
		paymentMethod: payment.paymentMethod,
		paymentDate: new Date(payment.paymentDate).toISOString().slice(0, 10),
		notes: payment.notes,
		issuedAt: receipt.issuedAt.toISOString()
	};
}

export async function getReceiptByNumber(receiptNumber: string) {
	const [receipt] = await db.select().from(receipts).where(eq(receipts.receiptNumber, receiptNumber)).limit(1);

	if (!receipt) {
		throw new AppError("Receipt not found", 404, "RECEIPT_NOT_FOUND");
	}

	return getReceiptById(receipt.id);
}
