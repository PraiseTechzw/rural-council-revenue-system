import { useAuthStore } from "../store/auth.store";

export function useAuth() {
	const user = useAuthStore((state) => state.user);
	const status = useAuthStore((state) => state.status);
	const errorMessage = useAuthStore((state) => state.errorMessage);
	const hydrate = useAuthStore((state) => state.hydrate);
	const login = useAuthStore((state) => state.login);
	const logout = useAuthStore((state) => state.logout);
	const setError = useAuthStore((state) => state.setError);

	return {
		user,
		status,
		errorMessage,
		isAuthenticated: status === "authenticated",
		isHydrating: status === "hydrating" || status === "idle",
		hydrate,
		login,
		logout,
		setError
	};
}
