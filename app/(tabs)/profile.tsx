import { useSession, signOut } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { data: session } = useSession();
  const user = session?.user ?? null;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Unable to open URL: ${url}`);
      }
    } catch {
      Alert.alert("Error", "Failed to open link");
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with settings */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
        {/* ✅ APPLE FIX: Show sign-in prompt for anonymous users */}
        {!user ? (
          <View style={styles.signInPrompt}>
            <Ionicons name="cloud-upload-outline" size={48} color="#ffffff" />
            <Text style={styles.signInTitle}>Sign in to Sync</Text>
            <Text style={styles.signInDescription}>
              Create an account to sync your highlights, reading progress, and
              preferences across all your devices.
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.signInButtonText}>
                Sign In or Create Account
              </Text>
            </TouchableOpacity>
            <Text style={styles.anonymousNote}>
              You can continue using the app without signing in. Your data will
              be stored locally on this device.
            </Text>
          </View>
        ) : (
          /* Profile Header for logged-in users */
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="#ffffff" />
            </View>
            <Text style={styles.userName}>
              {user?.email?.split("@")[0] || "User"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        )}

        {/* Account - Only for logged-in users */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/edit-profile")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={24} color="#ffffff" />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/notification-settings")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/privacy-security")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>My Bookmarks</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="download-outline" size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>Downloads</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL("mailto:Anchrapp@outlook.com")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL("https://anchrapp.io/terms.html")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#ffffff"
              />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL("https://anchrapp.io/privacy.html")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Sign Out - Only for logged-in users */}
        {user && (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 8,
  },
  manageButton: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
    marginRight: 8,
  },
  subscriptionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#0a0a0a",
    borderRadius: 8,
    marginTop: 12,
  },
  subscriptionNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3a1a1a",
  },
  signOutText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  signInPrompt: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    marginBottom: 24,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 12,
  },
  signInDescription: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  signInButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  anonymousNote: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
