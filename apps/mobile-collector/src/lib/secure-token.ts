import * as SecureStore from "expo-secure-store";

import { storageKeys } from "../constants/config";

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(storageKeys.secureAccessToken, token);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(storageKeys.secureAccessToken);
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(storageKeys.secureAccessToken);
}
