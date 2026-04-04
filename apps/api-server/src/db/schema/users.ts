import { boolean, pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { roles } from "./roles";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict", onUpdate: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number"),
    passwordHash: text("password_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date())
  },
  (table) => ({
    userEmailUnique: uniqueIndex("users_email_unique").on(table.email),
    userEmailIndex: index("users_email_idx").on(table.email),
    userRoleIndex: index("users_role_idx").on(table.roleId)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
