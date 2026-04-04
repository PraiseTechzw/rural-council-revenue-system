import { pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";

export const wards = pgTable(
  "wards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    wardNameUnique: uniqueIndex("wards_name_unique").on(table.name),
    wardCodeUnique: uniqueIndex("wards_code_unique").on(table.code),
    wardNameIndex: index("wards_name_idx").on(table.name)
  })
);

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;
