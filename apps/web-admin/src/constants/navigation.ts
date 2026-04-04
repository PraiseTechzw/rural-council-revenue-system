import type { Role } from "@/types/api";

export type NavigationItem = {
  href: string;
  label: string;
  roles: Role[];
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/payments", label: "Payments", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/receipts", label: "Receipts", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/reports", label: "Reports", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/settings", label: "Settings", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/collectors", label: "Collectors", roles: ["admin"] },
  { href: "/dashboard/revenue-sources", label: "Revenue Sources", roles: ["admin"] },
  { href: "/dashboard/wards", label: "Wards", roles: ["admin"] }
];

export type DashboardRole = Extract<Role, "admin" | "finance_officer">;

type DashboardRoleSummary = {
  title: string;
  subtitle: string;
  badge: string;
  capabilities: string[];
};

export const dashboardRoleSummaries: Record<DashboardRole, DashboardRoleSummary> = {
  admin: {
    title: "Administration Command Center",
    subtitle: "Manage the council's master data, operational controls, and revenue oversight in one place.",
    badge: "Admin access",
    capabilities: ["Manage collectors", "Maintain wards", "Publish revenue sources", "Review finance activity"]
  },
  finance_officer: {
    title: "Finance Control Desk",
    subtitle: "Monitor collections, verify receipts, and analyze revenue performance without editing master records.",
    badge: "Finance access",
    capabilities: ["Review payments", "Lookup receipts", "Analyze reports", "Change password"]
  }
};

export function getNavigationItemsForRole(role: Role | undefined): NavigationItem[] {
  if (!role) {
    return [];
  }

  return navigationItems.filter((item) => item.roles.includes(role));
}

export function canAccessDashboardPath(role: Role | undefined, pathname: string): boolean {
  if (!role) {
    return false;
  }

  return getNavigationItemsForRole(role).some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export function getDashboardRoleSummary(role: Role | undefined): DashboardRoleSummary {
  return role === "admin" ? dashboardRoleSummaries.admin : dashboardRoleSummaries.finance_officer;
}