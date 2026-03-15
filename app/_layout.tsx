import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { Component, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useSession } from "@/lib/auth-client";
import { SubscriptionProvider } from "@/lib/contexts/SubscriptionContext";
import { notificationService } from "@/lib/notifications";

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || "Unknown error"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutNav() {
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Caveat: require("../assets/fonts/Caveat.ttf"),
  });

  // Push notifications for logged-in users
  useEffect(() => {
    if (user?.id) {
      notificationService.registerForPushNotifications().catch(() => {});
    }
  }, [user?.id]);

  // Deep linking
  useEffect(() => {
    const sub = Linking.addEventListener("url", (event) => {
      console.log("Deep link received:", event.url);
    });
    return () => sub.remove();
  }, []);

  // Redirect signed-in users away from auth screens
  useEffect(() => {
    if (isPending || !segments[0]) return;
    if (user && segments[0] === "auth") {
      router.replace("/(tabs)");
    }
  }, [user, isPending, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
      initialRouteName="(tabs)"
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(marketing)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="book/[bookName]" />
      <Stack.Screen name="chapter/[bookName]/[chapter]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="privacy-security" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="search" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SubscriptionProvider>
        <RootLayoutNav />
      </SubscriptionProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
    marginTop: 8,
  },
});
