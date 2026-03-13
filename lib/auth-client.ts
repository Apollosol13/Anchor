import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const storage =
  Platform.OS !== 'web'
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
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081',
  plugins: [
    expoClient({
      scheme: 'anchor',
      storagePrefix: 'anchor-auth',
      storage,
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
