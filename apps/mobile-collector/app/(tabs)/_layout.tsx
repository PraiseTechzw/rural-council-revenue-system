import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../src/constants/colors";
import { useAuth } from "../../src/hooks/useAuth";

const iconMap = {
  dashboard: "grid-outline",
  "collect-payment": "cash-outline",
  transactions: "receipt-outline",
  sync: "sync-outline",
  profile: "person-circle-outline"
} as const;

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
        headerStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: colors.border,
          backgroundColor: "rgba(255,255,255,0.96)"
        }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name={iconMap.dashboard} size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="collect-payment"
        options={{
          title: "Collect",
          tabBarIcon: ({ color, size }) => <Ionicons name={iconMap["collect-payment"]} size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => <Ionicons name={iconMap.transactions} size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: "Sync",
          tabBarIcon: ({ color, size }) => <Ionicons name={iconMap.sync} size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name={iconMap.profile} size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
