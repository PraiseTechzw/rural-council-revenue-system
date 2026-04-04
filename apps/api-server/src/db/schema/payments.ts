import { decimal, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { collectors } from "./collectors";
import { payers } from "./payers";
import { revenueSources } from "./revenue_sources";
import { users } from "./users";
import { wards } from "./wards";

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "mobile_money", "bank", "other"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "posted", "voided", "reversed"]);
export const syncStatusEnum = pgEnum("sync_status", ["pending", "synced", "failed", "duplicate"]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    receiptNumber: text("receipt_number").notNull(),
    payerId: uuid("payer_id").notNull().references(() => payers.id, { onDelete: "restrict", onUpdate: "cascade" }),
    collectorId: uuid("collector_id").notNull().references(() => collectors.id, { onDelete: "restrict", onUpdate: "cascade" }),
    revenueSourceId: uuid("revenue_source_id").notNull().references(() => revenueSources.id, { onDelete: "restrict", onUpdate: "cascade" }),
    wardId: uuid("ward_id").references(() => wards.id, { onDelete: "set null", onUpdate: "cascade" }),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentDate: date("payment_date", { mode: "date" }).notNull(),
    notes: text("notes"),
    offlineReferenceId: text("offline_reference_id"),
    syncStatus: syncStatusEnum("sync_status").notNull().default("pending"),
    status: paymentStatusEnum("status").notNull().default("posted"),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    paymentReceiptUnique: uniqueIndex("payments_receipt_number_unique").on(table.receiptNumber),
    paymentOfflineReferenceUnique: uniqueIndex("payments_offline_reference_unique").on(table.offlineReferenceId).where(sql`${table.offlineReferenceId} is not null`),
    paymentDateIndex: index("payments_payment_date_idx").on(table.paymentDate),
    paymentCollectorIndex: index("payments_collector_idx").on(table.collectorId),
    paymentWardIndex: index("payments_ward_idx").on(table.wardId),
    paymentRevenueSourceIndex: index("payments_revenue_source_idx").on(table.revenueSourceId),
    paymentStatusIndex: index("payments_status_idx").on(table.status)
  })
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
