import axios from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/session";

const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

function normalizeApiBaseUrl(value: string | undefined): string {
  const trimmedValue = value?.trim().replace(/\/$/, "");

  if (!trimmedValue) {
    return DEFAULT_API_BASE_URL;
  }

  if (trimmedValue.startsWith("https://localhost") || trimmedValue.startsWith("https://127.0.0.1")) {
    return trimmedValue.replace(/^https:/, "http:");
  }

  return trimmedValue;
}

export const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAccessToken();
    }

    return Promise.reject(error);
  }
);
