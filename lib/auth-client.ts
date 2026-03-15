import { expoClient } from "@better-auth/expo/client";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const storage =
  Platform.OS !== "web"
    ? SecureStore
    : {
        getItem: (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch {}
        },
      };

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081",
  plugins: [
    expoClient({
      scheme: "io.anchrapp.anchor",
      storagePrefix: "anchor-auth",
      storage,
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;

/**
 * Native Apple Sign-In → Better Auth social sign-in.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  try {
    if (Platform.OS !== "ios") {
      return { error: new Error("Apple Sign In is only available on iOS") };
    }

    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const { error } = await authClient.signIn.social({
      provider: "apple",
      idToken: {
        token: credential.identityToken!,
        nonce,
      },
    });

    if (error) return { error };
    return { error: null };
  } catch (err: any) {
    if (err.code === "ERR_REQUEST_CANCELED") {
      return { error: new Error("Sign in was cancelled") };
    }
    return { error: err };
  }
}
