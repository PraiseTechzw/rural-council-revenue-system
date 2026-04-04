import { Stack } from "expo-router";

import { AppProviders } from "../src/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="payment/new" />
        <Stack.Screen name="payment/details" />
        <Stack.Screen name="payment/receipt" />
      </Stack>
    </AppProviders>
  );
}
