import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { payers } from "../../db/schema/payers";
import { wards } from "../../db/schema/wards";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";
import { AppError } from "../../middleware/error.middleware";

export async function listPayers(query: { page?: number | string; limit?: number | string; search?: string; wardId?: string }) {
	const { page, limit, offset } = parsePagination(query);
	const conditions = [] as ReturnType<typeof eq>[];

	if (query.search) {
		const search = `%${query.search}%`;
		conditions.push(or(ilike(payers.fullName, search), ilike(payers.businessName, search), ilike(payers.phoneNumber, search), ilike(payers.nationalId, search)) as never);
	}

	if (query.wardId) {
		conditions.push(eq(payers.wardId, query.wardId));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const [countRow] = await db.select({ value: count() }).from(payers).leftJoin(wards, eq(payers.wardId, wards.id)).where(whereClause);
	const rows = await db
		.select({
			id: payers.id,
			fullName: payers.fullName,
			businessName: payers.businessName,
			nationalId: payers.nationalId,
			phoneNumber: payers.phoneNumber,
			address: payers.address,
			wardId: payers.wardId,
			createdAt: payers.createdAt,
			updatedAt: payers.updatedAt,
			wardName: wards.name,
			wardCode: wards.code
		})
		.from(payers)
		.leftJoin(wards, eq(payers.wardId, wards.id))
		.where(whereClause)
		.orderBy(desc(payers.createdAt))
		.limit(limit)
		.offset(offset);

	return { rows, meta: buildPaginationMeta(page, limit, countRow?.value ?? 0) };
}

export async function getPayerById(id: string) {
	const [payer] = await db
		.select({
			id: payers.id,
			fullName: payers.fullName,
			businessName: payers.businessName,
			nationalId: payers.nationalId,
			phoneNumber: payers.phoneNumber,
			address: payers.address,
			wardId: payers.wardId,
			createdAt: payers.createdAt,
			updatedAt: payers.updatedAt,
			wardName: wards.name,
			wardCode: wards.code
		})
		.from(payers)
		.leftJoin(wards, eq(payers.wardId, wards.id))
		.where(eq(payers.id, id))
		.limit(1);

	if (!payer) {
		throw new AppError("Payer not found", 404, "PAYER_NOT_FOUND");
	}

	return payer;
}

export async function createPayer(input: { fullName: string; businessName?: string; nationalId?: string; phoneNumber?: string; address?: string; wardId?: string | null }, actorId?: string | null) {
	if (input.nationalId) {
		const [existing] = await db.select({ id: payers.id }).from(payers).where(eq(payers.nationalId, input.nationalId)).limit(1);
		if (existing) {
			throw new AppError("Payer national ID already exists", 409, "PAYER_EXISTS");
		}
	}

	const [payer] = await db.insert(payers).values(input).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "payer_created",
		entityType: "payer",
		entityId: payer.id,
		metadata: input,
		ipAddress: null
	});
	return payer;
}

export async function updatePayer(id: string, input: { fullName?: string; businessName?: string | null; nationalId?: string | null; phoneNumber?: string | null; address?: string | null; wardId?: string | null }, actorId?: string | null) {
	await getPayerById(id);
	const [payer] = await db.update(payers).set(input).where(eq(payers.id, id)).returning();
	await db.insert(auditLogs).values({
		userId: actorId ?? null,
		action: "payer_updated",
		entityType: "payer",
		entityId: id,
		metadata: input,
		ipAddress: null
	});
	return payer;
}
