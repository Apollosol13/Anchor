import { AnchorLogo } from "@/components/AnchorLogo";
import { authClient, signInWithApple } from "@/lib/auth-client";
import { notificationService } from "@/lib/notifications";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const router = useRouter();

  // Check if Apple Authentication is available
  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === "ios") {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setAppleAuthAvailable(isAvailable);
      }
    };
    checkAppleAuth();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name: "" })
      : await authClient.signIn.email({ email, password });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (isSignUp) {
      // Request push notification permission immediately after signup
      notificationService.registerForPushNotifications().catch(() => {});
      Alert.alert(
        "Success",
        "Account created! Please check your email to verify your account.",
        [{ text: "OK", onPress: () => setIsSignUp(false) }],
      );
    } else {
      // Request push notification permission on sign in too (in case not yet granted)
      notificationService.registerForPushNotifications().catch(() => {});
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithApple();
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Request push notification permission after Apple sign in
      notificationService.registerForPushNotifications().catch(() => {});
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <AnchorLogo size={80} color="#ffffff" />
          <Text style={styles.appName}>Anchor</Text>
          <Text style={styles.tagline}>Your Bible Companion</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? "password-new" : "password"}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          {appleAuthAvailable && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Native Apple Sign In Button */}
          {appleAuthAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Sign in to sync your bookmarks and preferences across devices
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  appName: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 20,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "#888888",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  primaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    color: "#888888",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  dividerText: {
    color: "#666666",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  footer: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    marginTop: 40,
    lineHeight: 20,
  },
});
