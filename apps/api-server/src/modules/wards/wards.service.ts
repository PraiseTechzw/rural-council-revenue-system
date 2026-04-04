import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { wards } from "../../db/schema/wards";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { AppError } from "../../middleware/error.middleware";

export async function listWards(query: { page?: number | string; limit?: number | string; search?: string }) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(wards.name, search), ilike(wards.code, search)) as never);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const [countRow] = await db.select({ value: count() }).from(wards).where(whereClause);

	const rows = await db.select().from(wards).where(whereClause).orderBy(desc(wards.createdAt)).limit(limit).offset(offset);

	return {
		rows,
		meta: buildPaginationMeta(page, limit, countRow?.value ?? 0)
	};
}

export async function getWardById(id: string) {
	const [ward] = await db.select().from(wards).where(eq(wards.id, id)).limit(1);

	if (!ward) {
		throw new AppError("Ward not found", 404, "WARD_NOT_FOUND");
	}

	return ward;
}

export async function createWard(input: { name: string; code: string; description?: string }, actorId?: string | null) {
	const [existing] = await db.select({ id: wards.id }).from(wards).where(or(eq(wards.name, input.name), eq(wards.code, input.code))).limit(1);

	if (existing) {
		throw new AppError("Ward name or code already exists", 409, "WARD_EXISTS");
	}

	const [ward] = await db.insert(wards).values(input).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "ward_created",
		entityType: "ward",
		entityId: ward.id,
		metadata: input,
		ipAddress: null
	});
	return ward;
}

export async function updateWard(id: string, input: { name?: string; code?: string; description?: string | null }, actorId?: string | null) {
	await getWardById(id);

	const updateData: Record<string, unknown> = {};
	if (input.name !== undefined) updateData.name = input.name;
	if (input.code !== undefined) updateData.code = input.code;
	if (input.description !== undefined) updateData.description = input.description;

	const [ward] = await db.update(wards).set(updateData).where(eq(wards.id, id)).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "ward_updated",
		entityType: "ward",
		entityId: id,
		metadata: input,
		ipAddress: null
	});
	return ward;
}
