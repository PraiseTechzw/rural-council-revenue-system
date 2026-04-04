import { pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { wards } from "./wards";

export const payers = pgTable(
  "payers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    businessName: text("business_name"),
    nationalId: text("national_id"),
    phoneNumber: text("phone_number"),
    address: text("address"),
    wardId: uuid("ward_id").references(() => wards.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    payerNationalIdUnique: uniqueIndex("payers_national_id_unique").on(table.nationalId),
    payerWardIndex: index("payers_ward_idx").on(table.wardId),
    payerNameIndex: index("payers_name_idx").on(table.fullName)
  })
);

export type Payer = typeof payers.$inferSelect;
export type NewPayer = typeof payers.$inferInsert;
