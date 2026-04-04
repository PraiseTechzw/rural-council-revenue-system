import { apiClient } from "./client";
import type { ApiResponse, UserRecord } from "@/types/api";

export async function listUsers(params: Record<string, string | number | boolean | undefined>) {
  const { data } = await apiClient.get<ApiResponse<UserRecord[]>>("/users", { params });
  return {
    rows: data.data ?? [],
    meta: data.meta
  };
}
