import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db";
import { payments } from "../../db/schema/payments";
import { revenueSources } from "../../db/schema/revenue_sources";
import { collectors } from "../../db/schema/collectors";
import { wards } from "../../db/schema/wards";
import { startOfDay, endOfDay } from "../../lib/date";

function buildConditions(filters: { startDate?: string; endDate?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	const conditions = [] as ReturnType<typeof eq>[];
	if (filters.startDate) conditions.push(gte(payments.paymentDate, startOfDay(filters.startDate)));
	if (filters.endDate) conditions.push(lte(payments.paymentDate, endOfDay(filters.endDate)));
	if (filters.collectorId) conditions.push(eq(payments.collectorId, filters.collectorId));
	if (filters.revenueSourceId) conditions.push(eq(payments.revenueSourceId, filters.revenueSourceId));
	if (filters.wardId) conditions.push(eq(payments.wardId, filters.wardId));
	return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function getDailyRevenue(filters: { date?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	const date = filters.date ?? new Date().toISOString().slice(0, 10);
	const whereClause = buildConditions({ ...filters, startDate: date, endDate: date });
	const [row] = await db.select({ paymentCount: count(), totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)` }).from(payments).where(whereClause);
	return { date, paymentCount: Number(row?.paymentCount ?? 0), totalRevenue: Number(row?.totalRevenue ?? 0) };
}

export async function getMonthlyRevenue(filters: { month?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	const month = filters.month ?? new Date().toISOString().slice(0, 7);
	const startDate = `${month}-01`;
	const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString().slice(0, 10);
	const whereClause = buildConditions({ ...filters, startDate, endDate });
	const [row] = await db.select({ paymentCount: count(), totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)` }).from(payments).where(whereClause);
	return { month, paymentCount: Number(row?.paymentCount ?? 0), totalRevenue: Number(row?.totalRevenue ?? 0) };
}

async function groupBySource(filters: { startDate?: string; endDate?: string }) {
	const whereClause = buildConditions(filters);
	return db
		.select({
			sourceId: revenueSources.id,
			sourceName: revenueSources.name,
			paymentCount: count(),
			totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`
		})
		.from(payments)
		.innerJoin(revenueSources, eq(payments.revenueSourceId, revenueSources.id))
		.where(whereClause)
		.groupBy(revenueSources.id, revenueSources.name)
		.orderBy(desc(sql<number>`coalesce(sum(${payments.amount}), 0)`));
}

export async function getRevenueBySource(filters: { startDate?: string; endDate?: string }) {
	const rows = await groupBySource(filters);
	return { rows };
}

export async function getRevenueByCollector(filters: { startDate?: string; endDate?: string }) {
	const whereClause = buildConditions(filters);
	const rows = await db
		.select({
			collectorId: collectors.id,
			paymentCount: count(),
			totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`
		})
		.from(payments)
		.innerJoin(collectors, eq(payments.collectorId, collectors.id))
		.where(whereClause)
		.groupBy(collectors.id)
		.orderBy(desc(sql<number>`coalesce(sum(${payments.amount}), 0)`));
	return { rows };
}

export async function getRevenueByWard(filters: { startDate?: string; endDate?: string }) {
	const whereClause = buildConditions(filters);
	const rows = await db
		.select({
			wardId: wards.id,
			wardName: wards.name,
			paymentCount: count(),
			totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`
		})
		.from(payments)
		.innerJoin(wards, eq(payments.wardId, wards.id))
		.where(whereClause)
		.groupBy(wards.id, wards.name)
		.orderBy(desc(sql<number>`coalesce(sum(${payments.amount}), 0)`));
	return { rows };
}
