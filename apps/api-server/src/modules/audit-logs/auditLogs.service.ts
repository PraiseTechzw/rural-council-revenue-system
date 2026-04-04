import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { auditLogs } from "../../db/schema/audit_logs";
import { users } from "../../db/schema/users";
import { roles } from "../../db/schema/roles";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";

export type AuditLogInput = {
	userId?: string | null;
	action: string;
	entityType: string;
	entityId?: string | null;
	metadata?: Record<string, unknown>;
	ipAddress?: string | null;
};

export async function recordAuditLog(input: AuditLogInput) {
	await db.insert(auditLogs).values({
		userId: input.userId ?? null,
		action: input.action,
		entityType: input.entityType,
		entityId: input.entityId ?? null,
		metadata: input.metadata ?? {},
		ipAddress: input.ipAddress ?? null
	});
}

export async function listAuditLogs(params: { page?: number | string; limit?: number | string; action?: string; entityType?: string }) {
	const { page, limit, offset } = parsePagination(params);

	const conditions = [] as Array<ReturnType<typeof eq>>;
	if (params.action) {
		conditions.push(eq(auditLogs.action, params.action));
	}
	if (params.entityType) {
		conditions.push(eq(auditLogs.entityType, params.entityType));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [countRow] = await db.select({ value: count() }).from(auditLogs).where(whereClause);

	const rows = await db
		.select({
			id: auditLogs.id,
			userId: auditLogs.userId,
			action: auditLogs.action,
			entityType: auditLogs.entityType,
			entityId: auditLogs.entityId,
			metadata: auditLogs.metadata,
			ipAddress: auditLogs.ipAddress,
			createdAt: auditLogs.createdAt,
			userEmail: users.email,
			userFirstName: users.firstName,
			userLastName: users.lastName,
			userRole: roles.name
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.leftJoin(roles, eq(users.roleId, roles.id))
		.where(whereClause as never)
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		rows,
		meta: buildPaginationMeta(page, limit, countRow?.value ?? 0)
	};
}
