import { Platform } from "react-native";
import { notificationApi } from "./api";

// Lazy-load expo-notifications to avoid localStorage errors during web SSR
let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

if (Platform.OS !== "web") {
  Notifications = require("expo-notifications");
  Device = require("expo-device");

  // Configure notification handler (native only)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationPreferences {
  dailyVerseEnabled: boolean;
  dailyVerseTime: string; // Format: "HH:MM" (24-hour)
  readingStreakEnabled: boolean;
  chapterCompletionEnabled: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Notifications || !Device) return null;

    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return null;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission denied");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "dd4eb5e2-67ac-4161-bceb-418044ec40a0",
      });

      this.pushToken = tokenData.data;

      // Register token via API route
      await notificationApi.registerToken(
        this.pushToken,
        Platform.OS as "ios" | "android",
      );

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Daily Verse Reminders",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#ffffff",
        });
      }

      return this.pushToken;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences | null> {
    try {
      const data = await notificationApi.getPreferences();
      return {
        dailyVerseEnabled: data.daily_verse_enabled ?? true,
        dailyVerseTime: data.daily_verse_time ?? "09:00",
        readingStreakEnabled: data.reading_streak_enabled ?? true,
        chapterCompletionEnabled: data.chapter_completion_enabled ?? false,
      };
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      return null;
    }
  }

  async saveNotificationPreferences(
    preferences: NotificationPreferences,
  ): Promise<boolean> {
    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";

      await notificationApi.updatePreferences({
        daily_verse_enabled: preferences.dailyVerseEnabled,
        daily_verse_time: preferences.dailyVerseTime,
        reading_streak_enabled: preferences.readingStreakEnabled,
        chapter_completion_enabled: preferences.chapterCompletionEnabled,
        timezone,
      });

      return true;
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      return false;
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }
}

export const notificationService = NotificationService.getInstance();
