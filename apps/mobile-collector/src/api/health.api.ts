import axios from "axios";

import { appConfig } from "../constants/config";

const healthClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 8000
});

export async function checkBackendHealth(): Promise<void> {
  await healthClient.get("/health");
}
