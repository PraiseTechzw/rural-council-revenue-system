import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const syncStatusLogEnum = pgEnum("sync_log_status", ["success", "partial", "failed"]);

export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    action: text("action").notNull().default("bulk_payment_sync"),
    payloadCount: integer("payload_count").notNull().default(0),
    successCount: integer("success_count").notNull().default(0),
    failureCount: integer("failure_count").notNull().default(0),
    status: syncStatusLogEnum("status").notNull().default("success"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    syncUserIndex: index("sync_logs_user_idx").on(table.userId),
    syncStatusIndex: index("sync_logs_status_idx").on(table.status),
    syncCreatedAtIndex: index("sync_logs_created_at_idx").on(table.createdAt)
  })
);

export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
