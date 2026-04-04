import { Stack } from "expo-router";

import { AppProviders } from "../src/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="payment/new" options={{ headerShown: true, title: "New Payment" }} />
        <Stack.Screen name="payment/details" options={{ headerShown: true, title: "Payment Details" }} />
        <Stack.Screen name="payment/receipt" options={{ headerShown: true, title: "Receipt" }} />
      </Stack>
    </AppProviders>
  );
}
