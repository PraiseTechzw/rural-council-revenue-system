"use client";

import { getCurrentUser } from "@/api/auth.api";
import { queryKeys } from "@/constants/query-keys";
import { getAccessToken } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    enabled: Boolean(getAccessToken())
  });
}
