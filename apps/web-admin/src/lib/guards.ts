import type { Role } from "@/types/api";

export function hasRole(userRole: Role | undefined, allowedRoles: Role[]): boolean {
	if (!userRole) {
		return false;
	}

	return allowedRoles.includes(userRole);
}
