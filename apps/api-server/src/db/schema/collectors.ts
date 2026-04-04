import { pgEnum, pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { wards } from "./wards";

export const collectorStatusEnum = pgEnum("collector_status", ["active", "inactive"]);

export const collectors = pgTable(
  "collectors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    wardId: uuid("ward_id").references(() => wards.id, { onDelete: "set null", onUpdate: "cascade" }),
    employeeNumber: text("employee_number"),
    status: collectorStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    collectorUserUnique: uniqueIndex("collectors_user_unique").on(table.userId),
    collectorEmployeeUnique: uniqueIndex("collectors_employee_unique").on(table.employeeNumber),
    collectorWardIndex: index("collectors_ward_idx").on(table.wardId),
    collectorStatusIndex: index("collectors_status_idx").on(table.status)
  })
);

export type Collector = typeof collectors.$inferSelect;
export type NewCollector = typeof collectors.$inferInsert;
