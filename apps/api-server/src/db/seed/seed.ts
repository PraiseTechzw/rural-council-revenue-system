import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { db } from "../../db";
import { collectors } from "../../db/schema/collectors";
import { revenueSources } from "../../db/schema/revenue_sources";
import { roles } from "../../db/schema/roles";
import { users } from "../../db/schema/users";
import { wards } from "../../db/schema/wards";
import { ensureDefaultRolesExist } from "../../modules/auth/auth.service";
import { logger } from "../../config/logger";

async function getRoleId(name: "admin" | "finance_officer" | "collector") {
  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);

  if (!role) {
    throw new Error(`Missing role: ${name}`);
  }

  return role.id;
}

async function main() {
  logger.info("Starting API seed...");

  await ensureDefaultRolesExist();

  const wardRows = await db
    .insert(wards)
    .values([
      { name: "Ward 1", code: "W01", description: "Sample ward 1" },
      { name: "Ward 2", code: "W02", description: "Sample ward 2" },
      { name: "Ward 3", code: "W03", description: "Sample ward 3" }
    ])
    .onConflictDoNothing({ target: wards.code })
    .returning({ id: wards.id, code: wards.code });

  const revenueSourceRows = await db
    .insert(revenueSources)
    .values([
      { name: "Shop Rental", code: "SHOP_RENTAL", category: "shop_rental", description: "Monthly shop rental" },
      { name: "Housing Stand", code: "HOUSING_STAND", category: "housing_stand", description: "Housing stand fee" },
      { name: "Mining Fee", code: "MINING_FEE", category: "mining_fee", description: "Mining-related fee" },
      { name: "Market Levy", code: "MARKET_LEVY", category: "market_levy", description: "Market-related charge" }
    ])
    .onConflictDoNothing({ target: revenueSources.code })
    .returning({ id: revenueSources.id, code: revenueSources.code });

  const adminRoleId = await getRoleId("admin");
  const financeRoleId = await getRoleId("finance_officer");
  const collectorRoleId = await getRoleId("collector");

  const adminPasswordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const financePasswordHash = await bcrypt.hash(env.SEED_FINANCE_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const collectorPasswordHash = await bcrypt.hash(env.SEED_COLLECTOR_PASSWORD, env.BCRYPT_SALT_ROUNDS);

  const [adminUser] = await db
    .insert(users)
    .values({
      roleId: adminRoleId,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@ruralcouncil.local",
      phoneNumber: "+263770000001",
      passwordHash: adminPasswordHash,
      isActive: true
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, email: users.email });

  const [financeUser] = await db
    .insert(users)
    .values({
      roleId: financeRoleId,
      firstName: "Finance",
      lastName: "Officer",
      email: "finance@ruralcouncil.local",
      phoneNumber: "+263770000002",
      passwordHash: financePasswordHash,
      isActive: true
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, email: users.email });

  const [collectorUser] = await db
    .insert(users)
    .values({
      roleId: collectorRoleId,
      firstName: "Collector",
      lastName: "One",
      email: "collector@ruralcouncil.local",
      phoneNumber: "+263770000003",
      passwordHash: collectorPasswordHash,
      isActive: true
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, email: users.email });

  if (collectorUser) {
    const firstWardId = wardRows[0]?.id;
    await db
      .insert(collectors)
      .values({
        userId: collectorUser.id,
        wardId: firstWardId ?? null,
        employeeNumber: "COL-001",
        status: "active"
      })
      .onConflictDoNothing({ target: collectors.userId });
  }

  logger.info("Seed completed", {
    admin: adminUser?.email ?? "existing",
    finance: financeUser?.email ?? "existing",
    collector: collectorUser?.email ?? "existing",
    wards: wardRows.length,
    revenueSources: revenueSourceRows.length
  });
}

main().catch((error) => {
  logger.error("Seed failed", error);
  process.exitCode = 1;
});