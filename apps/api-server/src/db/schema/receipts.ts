import { index, text, timestamp, uniqueIndex, uuid, pgTable } from "drizzle-orm/pg-core";
import { payments } from "./payments";

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade", onUpdate: "cascade" }),
    receiptNumber: text("receipt_number").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    receiptPaymentUnique: uniqueIndex("receipts_payment_unique").on(table.paymentId),
    receiptNumberUnique: uniqueIndex("receipts_number_unique").on(table.receiptNumber),
    receiptNumberIndex: index("receipts_number_idx").on(table.receiptNumber)
  })
);

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
