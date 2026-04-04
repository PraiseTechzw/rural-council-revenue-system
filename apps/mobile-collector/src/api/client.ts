import axios from "axios";

import { appConfig } from "../constants/config";
import { getAccessToken } from "../lib/secure-token";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const method = (config.method || "GET").toUpperCase();
    console.log(`[API] ${method} ${config.baseURL || ""}${config.url || ""}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      if (axios.isAxiosError(error)) {
        const method = (error.config?.method || "GET").toUpperCase();
        const url = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
        const status = error.response?.status;
        const data = error.response?.data;

        if (!error.response) {
          console.error("[API] Connection failed", {
            method,
            url,
            code: error.code,
            message: error.message,
            timeout: error.config?.timeout
          });
        } else {
          console.error("[API] Request failed", {
            method,
            url,
            status,
            data
          });
        }
      } else {
        console.error("[API] Unknown error", error);
      }
    }

    return Promise.reject(error);
  }
);
