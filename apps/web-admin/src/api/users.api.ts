import { apiClient } from "./client";
import type { ApiResponse, UserRecord } from "@/types/api";

export async function listUsers(params: Record<string, string | number | boolean | undefined>) {
  const { data } = await apiClient.get<ApiResponse<UserRecord[]>>("/users", { params });
  return {
    rows: data.data ?? [],
    meta: data.meta
  };
}

export async function createUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  roleName: "admin" | "finance_officer" | "collector";
}) {
  const { data } = await apiClient.post<ApiResponse<UserRecord>>("/users", payload);

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to create user");
  }

  return data.data;
}

export async function updateUser(
  id: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string | null;
    isActive?: boolean;
    roleName?: "admin" | "finance_officer" | "collector";
  }
) {
  const { data } = await apiClient.patch<ApiResponse<UserRecord>>(`/users/${id}`, payload);

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to update user");
  }

  return data.data;
}
