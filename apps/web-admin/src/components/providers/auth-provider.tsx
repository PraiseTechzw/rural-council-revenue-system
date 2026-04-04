"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { login as loginRequest, logout as logoutRequest } from "@/api/auth.api";
import { clearAccessToken, setAccessToken } from "@/lib/session";
import type { AuthUser, LoginPayload } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";

type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      setUser,
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
    [queryClient, user]
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