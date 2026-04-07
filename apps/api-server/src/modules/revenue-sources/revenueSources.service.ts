import { and, count, desc, eq, ilike, ne, or } from "drizzle-orm";
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
	const payload = {
		...input,
		name: input.name.trim(),
		code: input.code.trim(),
		description: input.description?.trim() || undefined
	};

	const [existing] = await db.select({ id: revenueSources.id }).from(revenueSources).where(or(eq(revenueSources.name, payload.name), eq(revenueSources.code, payload.code))).limit(1);

	if (existing) {
		throw new AppError("Revenue source name or code already exists", 409, "REVENUE_SOURCE_EXISTS");
	}

	const [row] = await db.insert(revenueSources).values(payload).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "revenue_source_created",
		entityType: "revenue_source",
		entityId: row.id,
		metadata: payload,
		ipAddress: null
	});
	return row;
}

export async function updateRevenueSource(id: string, input: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean }, actorId?: string | null) {
	const current = await getRevenueSourceById(id);

	const updateData: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean } = {};
	if (input.name !== undefined) updateData.name = input.name.trim();
	if (input.code !== undefined) updateData.code = input.code.trim();
	if (input.category !== undefined) updateData.category = input.category;
	if (input.description !== undefined) updateData.description = input.description === null ? null : input.description.trim() || null;
	if (input.isActive !== undefined) updateData.isActive = input.isActive;

	if (updateData.name && updateData.name !== current.name) {
		const [nameExists] = await db
			.select({ id: revenueSources.id })
			.from(revenueSources)
			.where(and(eq(revenueSources.name, updateData.name), ne(revenueSources.id, id)))
			.limit(1);

		if (nameExists) {
			throw new AppError("Revenue source name already exists", 409, "REVENUE_SOURCE_NAME_EXISTS");
		}
	}

	if (updateData.code && updateData.code !== current.code) {
		const [codeExists] = await db
			.select({ id: revenueSources.id })
			.from(revenueSources)
			.where(and(eq(revenueSources.code, updateData.code), ne(revenueSources.id, id)))
			.limit(1);

		if (codeExists) {
			throw new AppError("Revenue source code already exists", 409, "REVENUE_SOURCE_CODE_EXISTS");
		}
	}

	const [row] = await db.update(revenueSources).set(updateData).where(eq(revenueSources.id, id)).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "revenue_source_updated",
		entityType: "revenue_source",
		entityId: id,
		metadata: updateData,
		ipAddress: null
	});
	return row;
}
