import { authApi } from "../../api/auth.api";
import type { CollectorUser, LoginPayload } from "../../types/auth.types";

export async function loginCollector(payload: LoginPayload) {
  return authApi.login(payload);
}

export async function fetchCurrentCollector(): Promise<CollectorUser> {
  return authApi.me();
}
