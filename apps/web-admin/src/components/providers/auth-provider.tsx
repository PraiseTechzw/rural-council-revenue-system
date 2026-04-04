"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@/api/auth.api";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/session";
import type { AuthUser, LoginPayload } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";

type AuthContextType = {
  user: AuthUser | null;
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      const token = getAccessToken();

      if (!token) {
        if (mounted) {
          setUser(null);
          setIsLoadingAuth(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          queryClient.setQueryData(queryKeys.currentUser, currentUser);
        }
      } catch {
        clearAccessToken();
        if (mounted) {
          setUser(null);
          queryClient.removeQueries({ queryKey: queryKeys.currentUser });
        }
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoadingAuth,
      isAuthenticated: Boolean(user),
      setUser,
      refreshUser: async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        queryClient.setQueryData(queryKeys.currentUser, currentUser);
      },
      login: async (payload) => {
        const result = await loginRequest(payload);
        setAccessToken(result.tokens.accessToken);
        setUser(result.user);
        queryClient.setQueryData(queryKeys.currentUser, result.user);
      },
      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          clearAccessToken();
          setUser(null);
          queryClient.removeQueries({ queryKey: queryKeys.currentUser });
        }
      }
    }),
    [isLoadingAuth, queryClient, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}