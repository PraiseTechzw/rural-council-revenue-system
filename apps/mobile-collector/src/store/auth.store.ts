import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authApi } from "../api/auth.api";
import { storageKeys } from "../constants/config";
import { clearAccessToken, getAccessToken, saveAccessToken } from "../lib/secure-token";
import type { AuthStatus, CollectorUser, LoginPayload } from "../types/auth.types";

function assertCollectorAccess(user: CollectorUser) {
	if (user.role !== "collector") {
		throw new Error("This app is only available for collector accounts.");
	}

	if (user.collectorStatus && user.collectorStatus !== "active") {
		throw new Error("Your collector assignment is inactive. Contact an administrator.");
	}
}

type AuthState = {
	user: CollectorUser | null;
	status: AuthStatus;
	token: string | null;
	errorMessage: string | null;
	hydrate: () => Promise<void>;
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => Promise<void>;
	setError: (message: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			status: "idle",
			token: null,
			errorMessage: null,

			async hydrate() {
				if (get().status === "hydrating") {
					return;
				}

				set({ status: "hydrating", errorMessage: null });

				try {
					const token = await getAccessToken();
					if (!token) {
						set({ token: null, user: null, status: "unauthenticated" });
						return;
					}

					const user = await authApi.me();
					assertCollectorAccess(user);
					set({ token, user, status: "authenticated" });
				} catch (error) {
					await clearAccessToken();
					set({
						token: null,
						user: null,
						status: "unauthenticated",
						errorMessage: error instanceof Error ? error.message : "Session expired. Please sign in again."
					});
				}
			},

			async login(payload) {
				set({ status: "hydrating", errorMessage: null });
				try {
					const response = await authApi.login(payload);

					await saveAccessToken(response.accessToken);
					const user = await authApi.me();
					assertCollectorAccess(user);

					set({
						token: response.accessToken,
						user,
						status: "authenticated",
						errorMessage: null
					});
				} catch (error) {
					await clearAccessToken();
					set({
						token: null,
						user: null,
						status: "unauthenticated",
						errorMessage: error instanceof Error ? error.message : "Login failed. Check your details and network."
					});
					throw error;
				}
			},

			async logout() {
				await clearAccessToken();
				set({ token: null, user: null, status: "unauthenticated", errorMessage: null });
			},

			setError(message) {
				set({ errorMessage: message });
			}
		}),
		{
			name: storageKeys.authState,
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ user: state.user })
		}
	)
);
