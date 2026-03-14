import { Redirect, Stack } from "expo-router";
import { Platform } from "react-native";

export default function MarketingLayout() {
  // Marketing pages are web-only — redirect native to tabs
  if (Platform.OS !== "web") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
