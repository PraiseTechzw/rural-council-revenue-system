import { count, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { syncLogs } from "../../db/schema/sync_logs";
import type { AuthUser } from "../auth/auth.types";
import { createPayment } from "../payments/payments.service";
import type { CreatePaymentInput } from "../payments/payments.types";
import { buildPaginationMeta, parsePagination } from "../../lib/pagination";

export async function bulkSyncPayments(items: CreatePaymentInput[], actor: AuthUser) {
	const results = [] as Array<{ offlineReferenceId: string | null | undefined; success: boolean; duplicate?: boolean; payment?: unknown; error?: string }>;

	for (const item of items) {
		try {
			const result = await createPayment(item, actor);
			results.push({
				offlineReferenceId: item.offlineReferenceId,
				success: true,
				duplicate: result.duplicate,
				payment: result.payment
			});
		} catch (error) {
			results.push({
				offlineReferenceId: item.offlineReferenceId,
				success: false,
				error: error instanceof Error ? error.message : "Failed to sync payment"
			});
		}
	}

	const successCount = results.filter((result) => result.success).length;
	const failureCount = results.length - successCount;
	const status = failureCount === 0 ? "success" : successCount > 0 ? "partial" : "failed";
	const syncLogResults = results.map((result) => ({
		offlineReferenceId: result.offlineReferenceId,
		success: result.success,
		duplicate: result.duplicate ?? false,
		error: result.error ?? null
	}));

	await db.insert(syncLogs).values({
		userId: actor.id,
		action: "bulk_payment_sync",
		payloadCount: items.length,
		successCount,
		failureCount,
		status,
		metadata: { results: syncLogResults }
	});

	return {
		results,
		summary: {
			total: items.length,
			successCount,
			failureCount,
			status
		}
	};
}

export async function listSyncLogs(query: { page?: number | string; limit?: number | string }) {
	const { page, limit, offset } = parsePagination(query);
	const [countRow] = await db.select({ value: count() }).from(syncLogs);

	const rows = await db
		.select()
		.from(syncLogs)
		.orderBy(desc(syncLogs.createdAt))
		.limit(limit)
		.offset(offset);

	return { rows, meta: buildPaginationMeta(page, limit, countRow?.value ?? 0) };
}
