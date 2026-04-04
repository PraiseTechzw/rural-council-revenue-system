import { Redirect } from "expo-router";

import { useAuth } from "../src/hooks/useAuth";

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? "/(tabs)/dashboard" : "/(auth)/login"} />;
}
