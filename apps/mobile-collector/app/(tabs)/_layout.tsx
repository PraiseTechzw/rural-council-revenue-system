import { Redirect, Tabs } from "expo-router";

import { colors } from "../../src/constants/colors";
import { useAuth } from "../../src/hooks/useAuth";

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerTitleStyle: { color: colors.textPrimary },
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 62, paddingBottom: 8 }
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="collect-payment" options={{ title: "Collect" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      <Tabs.Screen name="sync" options={{ title: "Sync" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
