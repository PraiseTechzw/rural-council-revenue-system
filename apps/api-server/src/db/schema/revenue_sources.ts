import { boolean, pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";

export const revenueSources = pgTable(
  "revenue_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    revenueSourceNameUnique: uniqueIndex("revenue_sources_name_unique").on(table.name),
    revenueSourceCodeUnique: uniqueIndex("revenue_sources_code_unique").on(table.code),
    revenueSourceCategoryIndex: index("revenue_sources_category_idx").on(table.category)
  })
);

export type RevenueSource = typeof revenueSources.$inferSelect;
export type NewRevenueSource = typeof revenueSources.$inferInsert;
