import axios from "axios";

import { appConfig } from "../constants/config";

const healthClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 8000
});

export async function checkBackendHealth(): Promise<void> {
  try {
    await healthClient.get("/health");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          `Cannot connect to backend at ${appConfig.apiBaseUrl}. Ensure API server is running and use 10.0.2.2 for Android emulator or your PC LAN IP for a real device.`
        );
      }

      const apiMessage = (error.response.data as { message?: string } | undefined)?.message;
      throw new Error(apiMessage || `Backend health check failed (${error.response.status}).`);
    }

    throw new Error("Backend health check failed.");
  }
}
