import { and, count, desc, eq, gte, ilike, lte, or, sum } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { collectors } from "../../db/schema/collectors";
import { payers } from "../../db/schema/payers";
import { payments } from "../../db/schema/payments";
import { receipts } from "../../db/schema/receipts";
import { revenueSources } from "../../db/schema/revenue_sources";
import { users } from "../../db/schema/users";
import { wards } from "../../db/schema/wards";
import { normalizeCurrency } from "../../lib/currency";
import { endOfDay, nowUtc, startOfDay, toIsoDate } from "../../lib/date";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { generateReceiptNumber } from "../../lib/receipt-number";
import { AppError } from "../../middleware/error.middleware";
import type { AuthUser } from "../auth/auth.types";
import type { CreatePaymentInput, DailySummaryFilterInput, PaymentFilterInput } from "./payments.types";

type PaymentRecord = {
	paymentId: string;
	receiptId: string | null;
	receiptNumber: string;
	payerId: string;
	payerName: string;
	collectorId: string;
	collectorUserId: string;
	collectorFirstName: string;
	collectorLastName: string;
	collectorEmail: string;
	revenueSourceId: string;
	revenueSourceName: string;
	wardId: string | null;
	wardName: string | null;
	wardCode: string | null;
	amount: string;
	currency: string;
	paymentMethod: string;
	paymentDate: Date;
	notes: string | null;
	offlineReferenceId: string | null;
	syncStatus: string;
	status: string;
	createdByUserId: string;
	createdAt: Date;
	updatedAt: Date;
	receiptIssuedAt: Date | null;
};

function paymentSelect() {
	return {
		paymentId: payments.id,
		receiptId: receipts.id,
		receiptNumber: payments.receiptNumber,
		payerId: payers.id,
		payerName: payers.fullName,
		collectorId: collectors.id,
		collectorUserId: users.id,
		collectorFirstName: users.firstName,
		collectorLastName: users.lastName,
		collectorEmail: users.email,
		revenueSourceId: revenueSources.id,
		revenueSourceName: revenueSources.name,
		wardId: wards.id,
		wardName: wards.name,
		wardCode: wards.code,
		amount: payments.amount,
		currency: payments.currency,
		paymentMethod: payments.paymentMethod,
		paymentDate: payments.paymentDate,
		notes: payments.notes,
		offlineReferenceId: payments.offlineReferenceId,
		syncStatus: payments.syncStatus,
		status: payments.status,
		createdByUserId: payments.createdByUserId,
		createdAt: payments.createdAt,
		updatedAt: payments.updatedAt,
		receiptIssuedAt: receipts.issuedAt
	};
}

async function loadPaymentById(paymentId: string): Promise<PaymentRecord | null> {
	const [payment] = await db
		.select(paymentSelect())
		.from(payments)
		.innerJoin(payers, eq(payments.payerId, payers.id))
		.innerJoin(collectors, eq(payments.collectorId, collectors.id))
		.innerJoin(users, eq(collectors.userId, users.id))
		.innerJoin(revenueSources, eq(payments.revenueSourceId, revenueSources.id))
		.leftJoin(wards, eq(payments.wardId, wards.id))
		.leftJoin(receipts, eq(receipts.paymentId, payments.id))
		.where(eq(payments.id, paymentId))
		.limit(1);

	return payment ?? null;
}

async function loadPaymentByOfflineReferenceId(offlineReferenceId: string) {
	const [payment] = await db
		.select(paymentSelect())
		.from(payments)
		.innerJoin(payers, eq(payments.payerId, payers.id))
		.innerJoin(collectors, eq(payments.collectorId, collectors.id))
		.innerJoin(users, eq(collectors.userId, users.id))
		.innerJoin(revenueSources, eq(payments.revenueSourceId, revenueSources.id))
		.leftJoin(wards, eq(payments.wardId, wards.id))
		.leftJoin(receipts, eq(receipts.paymentId, payments.id))
		.where(eq(payments.offlineReferenceId, offlineReferenceId))
		.limit(1);

	return payment ?? null;
}

function normalizePaymentRecord(record: PaymentRecord) {
	return {
		id: record.paymentId,
		receipt: {
			id: record.receiptId,
			receiptNumber: record.receiptNumber,
			issuedAt: record.receiptIssuedAt
		},
		payer: {
			id: record.payerId,
			name: record.payerName
		},
		collector: {
			id: record.collectorId,
			userId: record.collectorUserId,
			firstName: record.collectorFirstName,
			lastName: record.collectorLastName,
			email: record.collectorEmail
		},
		revenueSource: {
			id: record.revenueSourceId,
			name: record.revenueSourceName
		},
		ward: record.wardId
			? {
					id: record.wardId,
					name: record.wardName,
					code: record.wardCode
				}
			: null,
		amount: record.amount,
		currency: record.currency,
		paymentMethod: record.paymentMethod,
		paymentDate: record.paymentDate,
		notes: record.notes,
		offlineReferenceId: record.offlineReferenceId,
		syncStatus: record.syncStatus,
		status: record.status,
		createdByUserId: record.createdByUserId,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	};
}

async function validateRelations(input: CreatePaymentInput, actor: AuthUser) {
	const [payer] = await db.select({ id: payers.id }).from(payers).where(eq(payers.id, input.payerId)).limit(1);
	const [revenueSource] = await db.select({ id: revenueSources.id }).from(revenueSources).where(eq(revenueSources.id, input.revenueSourceId)).limit(1);
	const [collector] = await db
		.select({
			id: collectors.id,
			userId: collectors.userId,
			status: collectors.status
		})
		.from(collectors)
		.where(eq(collectors.id, input.collectorId))
		.limit(1);
	const [ward] = input.wardId ? await db.select({ id: wards.id }).from(wards).where(eq(wards.id, input.wardId)).limit(1) : [null];

	if (!payer) throw new AppError("Payer not found", 404, "PAYER_NOT_FOUND");
	if (!revenueSource) throw new AppError("Revenue source not found", 404, "REVENUE_SOURCE_NOT_FOUND");
	if (!collector) throw new AppError("Collector not found", 404, "COLLECTOR_NOT_FOUND");
	if (collector.status !== "active") throw new AppError("Collector is inactive", 400, "COLLECTOR_INACTIVE");
	if (!ward && input.wardId) throw new AppError("Ward not found", 404, "WARD_NOT_FOUND");

	if (actor.role === "collector" && collector.userId !== actor.id) {
		throw new AppError("Collectors can only record payments against their own collector profile", 403, "FORBIDDEN");
	}
}

async function insertPaymentTx(tx: any, input: CreatePaymentInput, actor: AuthUser) {
	const paymentReceiptNumber = generateReceiptNumber();
	const paymentDate = new Date(input.paymentDate);

	const [payment] = await tx
		.insert(payments)
		.values({
			payerId: input.payerId,
			collectorId: input.collectorId,
			revenueSourceId: input.revenueSourceId,
			wardId: input.wardId ?? null,
			amount: input.amount.toFixed(2),
			currency: normalizeCurrency(input.currency),
			paymentMethod: input.paymentMethod,
			paymentDate,
			notes: input.notes ?? null,
			offlineReferenceId: input.offlineReferenceId ?? null,
			syncStatus: input.syncStatus ?? (input.offlineReferenceId ? "pending" : "synced"),
			status: input.status ?? "posted",
			createdByUserId: actor.id,
			receiptNumber: paymentReceiptNumber
		})
		.returning({ id: payments.id, receiptNumber: payments.receiptNumber });

	if (!payment) {
		throw new AppError("Unable to create payment", 500, "PAYMENT_CREATE_FAILED");
	}

	await tx
		.insert(receipts)
		.values({
			paymentId: payment.id,
			receiptNumber: paymentReceiptNumber
		})
		.returning({ id: receipts.id });

	await tx.insert(auditLogs).values({
		userId: actor.id,
		action: "payment_created",
		entityType: "payment",
		entityId: payment.id,
		metadata: {
			receiptNumber: paymentReceiptNumber,
			paymentMethod: input.paymentMethod,
			amount: input.amount,
			currency: normalizeCurrency(input.currency)
		},
		ipAddress: null
	});

	const created = await loadPaymentById(payment.id);

	if (!created) {
		throw new AppError("Created payment could not be loaded", 500, "PAYMENT_CREATE_FAILED");
	}

	return normalizePaymentRecord(created);
}

export async function createPayment(input: CreatePaymentInput, actor: AuthUser) {
	await validateRelations(input, actor);

	try {
		const payment = await db.transaction(async (tx) => insertPaymentTx(tx, input, actor));
		return { payment, duplicate: false };
	} catch (error) {
		const err = error as { code?: string; constraint?: string };

		if (err.code === "23505" && input.offlineReferenceId) {
			const existing = await loadPaymentByOfflineReferenceId(input.offlineReferenceId);
			if (existing) {
				return { payment: normalizePaymentRecord(existing), duplicate: true };
			}
		}

		throw error;
	}
}

export async function getPaymentById(id: string) {
	const payment = await loadPaymentById(id);

	if (!payment) {
		throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
	}

	return normalizePaymentRecord(payment);
}

export async function listPayments(query: PaymentFilterInput) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.collectorId) conditions.push(eq(payments.collectorId, query.collectorId));
	if (query.revenueSourceId) conditions.push(eq(payments.revenueSourceId, query.revenueSourceId));
	if (query.wardId) conditions.push(eq(payments.wardId, query.wardId));
	if (query.paymentMethod) conditions.push(eq(payments.paymentMethod, query.paymentMethod));
	if (query.status) conditions.push(eq(payments.status, query.status));
	if (query.startDate) conditions.push(gte(payments.paymentDate, startOfDay(query.startDate)));
	if (query.endDate) conditions.push(lte(payments.paymentDate, endOfDay(query.endDate)));
	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(payers.fullName, search), ilike(payments.receiptNumber, search), ilike(revenueSources.name, search)) as never);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const [countRow] = await db.select({ value: count() }).from(payments).leftJoin(payers, eq(payments.payerId, payers.id)).leftJoin(revenueSources, eq(payments.revenueSourceId, revenueSources.id)).where(whereClause);

	const rows = await db
		.select(paymentSelect())
		.from(payments)
		.innerJoin(payers, eq(payments.payerId, payers.id))
		.innerJoin(collectors, eq(payments.collectorId, collectors.id))
		.innerJoin(users, eq(collectors.userId, users.id))
		.innerJoin(revenueSources, eq(payments.revenueSourceId, revenueSources.id))
		.leftJoin(wards, eq(payments.wardId, wards.id))
		.leftJoin(receipts, eq(receipts.paymentId, payments.id))
		.where(whereClause)
		.orderBy(desc(payments.paymentDate), desc(payments.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		rows: rows.map(normalizePaymentRecord),
		meta: buildPaginationMeta(page, limit, countRow?.value ?? 0)
	};
}

export async function getCollectorDailySummary(query: DailySummaryFilterInput) {
	const date = query.date ?? toIsoDate(nowUtc());
	const conditions = [eq(payments.paymentDate, new Date(date))] as ReturnType<typeof eq>[];

	if (query.collectorId) conditions.push(eq(payments.collectorId, query.collectorId));
	if (query.revenueSourceId) conditions.push(eq(payments.revenueSourceId, query.revenueSourceId));
	if (query.wardId) conditions.push(eq(payments.wardId, query.wardId));

	const whereClause = and(...conditions);

	const [summary] = await db
		.select({
			paymentCount: count(),
			totalAmount: sum(payments.amount)
		})
		.from(payments)
		.where(whereClause);

	return {
		date,
		paymentCount: Number(summary?.paymentCount ?? 0),
		totalAmount: Number(summary?.totalAmount ?? 0)
	};
}

export async function listRecentPaymentsForReports(query: { startDate?: string; endDate?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	const conditions = [] as ReturnType<typeof eq>[];
	if (query.collectorId) conditions.push(eq(payments.collectorId, query.collectorId));
	if (query.revenueSourceId) conditions.push(eq(payments.revenueSourceId, query.revenueSourceId));
	if (query.wardId) conditions.push(eq(payments.wardId, query.wardId));
	if (query.startDate) conditions.push(gte(payments.paymentDate, startOfDay(query.startDate)));
	if (query.endDate) conditions.push(lte(payments.paymentDate, endOfDay(query.endDate)));

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	return db
		.select({
			paymentDate: payments.paymentDate,
			amount: payments.amount,
			collectorId: payments.collectorId,
			revenueSourceId: payments.revenueSourceId,
			wardId: payments.wardId,
			status: payments.status,
			paymentMethod: payments.paymentMethod
		})
		.from(payments)
		.where(whereClause);
}
