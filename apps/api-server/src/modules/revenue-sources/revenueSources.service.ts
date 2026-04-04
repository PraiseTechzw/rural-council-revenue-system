import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { revenueSources } from "../../db/schema/revenue_sources";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { AppError } from "../../middleware/error.middleware";

export async function listRevenueSources(query: { page?: number | string; limit?: number | string; search?: string; category?: string; isActive?: boolean }) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(revenueSources.name, search), ilike(revenueSources.code, search)) as never);
	}

	if (query.category) {
		conditions.push(eq(revenueSources.category, query.category));
	}

	if (typeof query.isActive === "boolean") {
		conditions.push(eq(revenueSources.isActive, query.isActive));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const [countRow] = await db.select({ value: count() }).from(revenueSources).where(whereClause);
	const rows = await db.select().from(revenueSources).where(whereClause).orderBy(desc(revenueSources.createdAt)).limit(limit).offset(offset);

	return { rows, meta: buildPaginationMeta(page, limit, countRow?.value ?? 0) };
}

export async function getRevenueSourceById(id: string) {
	const [row] = await db.select().from(revenueSources).where(eq(revenueSources.id, id)).limit(1);

	if (!row) {
		throw new AppError("Revenue source not found", 404, "REVENUE_SOURCE_NOT_FOUND");
	}

	return row;
}

export async function createRevenueSource(input: { name: string; code: string; category: string; description?: string; isActive?: boolean }, actorId?: string | null) {
	const [existing] = await db.select({ id: revenueSources.id }).from(revenueSources).where(or(eq(revenueSources.name, input.name), eq(revenueSources.code, input.code))).limit(1);

	if (existing) {
		throw new AppError("Revenue source name or code already exists", 409, "REVENUE_SOURCE_EXISTS");
	}

	const [row] = await db.insert(revenueSources).values(input).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "revenue_source_created",
		entityType: "revenue_source",
		entityId: row.id,
		metadata: input,
		ipAddress: null
	});
	return row;
}

export async function updateRevenueSource(id: string, input: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean }, actorId?: string | null) {
	await getRevenueSourceById(id);
	const [row] = await db.update(revenueSources).set(input).where(eq(revenueSources.id, id)).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "revenue_source_updated",
		entityType: "revenue_source",
		entityId: id,
		metadata: input,
		ipAddress: null
	});
	return row;
}
