export type AuthStatus = "idle" | "hydrating" | "authenticated" | "unauthenticated";

export type CollectorUser = {
	id: string;
	name: string;
	email?: string;
	role: string;
	assignedWard?: string;
	wardId?: string;
	collectorStatus?: "active" | "inactive";
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type LoginResponse = {
	accessToken: string;
	user?: CollectorUser;
};
