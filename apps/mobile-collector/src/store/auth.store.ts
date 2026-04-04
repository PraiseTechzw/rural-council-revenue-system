import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authApi } from "../api/auth.api";
import { storageKeys } from "../constants/config";
import { clearAccessToken, getAccessToken, saveAccessToken } from "../lib/secure-token";
import type { AuthStatus, CollectorUser, LoginPayload } from "../types/auth.types";

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

				const token = await getAccessToken();
				if (!token) {
					set({ token: null, user: null, status: "unauthenticated" });
					return;
				}

				try {
					const user = await authApi.me();
					set({ token, user, status: "authenticated" });
				} catch {
					await clearAccessToken();
					set({ token: null, user: null, status: "unauthenticated" });
				}
			},

			async login(payload) {
				set({ status: "hydrating", errorMessage: null });
				const response = await authApi.login(payload);

				await saveAccessToken(response.accessToken);
				const user = response.user ?? (await authApi.me());

				set({
					token: response.accessToken,
					user,
					status: "authenticated",
					errorMessage: null
				});
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
