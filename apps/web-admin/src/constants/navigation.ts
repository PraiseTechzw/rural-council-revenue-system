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
  { href: "/dashboard/collectors", label: "Collectors", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/revenue-sources", label: "Revenue Sources", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/wards", label: "Wards", roles: ["admin", "finance_officer"] },
  { href: "/dashboard/settings", label: "Settings", roles: ["admin", "finance_officer"] }
];