import { db } from "@/server/db";
import { notificationPreferences, pushTokens } from "@/server/db/schema";
import { serve } from "@upstash/workflow";
import { eq } from "drizzle-orm";
import {
  Expo,
  type ExpoPushMessage,
  type ExpoPushTicket,
} from "expo-server-sdk";

const expo = new Expo();

// ─── Types ───

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

export interface UserToNotify {
  userId: string;
  type: "daily_verse" | "streak_reminder";
  title: string;
  body: string;
  data: Record<string, string>;
}

// ─── Core: send push to a single user ───

export async function sendToUser(
  notification: PushNotification,
): Promise<boolean> {
  try {
    const tokens = await db
      .select({
        id: pushTokens.id,
        pushToken: pushTokens.pushToken,
        platform: pushTokens.platform,
      })
      .from(pushTokens)
      .where(eq(pushTokens.userId, notification.userId));

    if (tokens.length === 0) return false;

    const validTokens = [
      ...new Set(
        tokens
          .map((t) => t.pushToken)
          .filter((token) => Expo.isExpoPushToken(token)),
      ),
    ];

    if (validTokens.length === 0) return false;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: (notification.sound || "default") as "default",
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        console.error("Error sending notification chunk:", err);
      }
    }

    // Clean up stale tokens that returned DeviceNotRegistered
    const staleTokens: string[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (
        ticket.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered"
      ) {
        staleTokens.push(validTokens[i]);
      }
    }

    if (staleTokens.length > 0) {
      for (const token of staleTokens) {
        await db
          .delete(pushTokens)
          .where(eq(pushTokens.pushToken, token));
      }
      console.log(`Cleaned up ${staleTokens.length} stale push tokens`);
    }

    return tickets.some((t) => t.status === "ok");
  } catch (err) {
    console.error("Error in sendToUser:", err);
    return false;
  }
}

export async function sendTestNotification(userId: string): Promise<boolean> {
  return sendToUser({
    userId,
    title: "Test Notification",
    body: "This is a test notification from Anchor.",
    data: { type: "test" },
    sound: "default",
  });
}

// ─── Scheduling: find users who need notifications right now ───

function getCurrentTimeInTimezone(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    return `${hour}:${minute}`;
  } catch {
    return "";
  }
}

export async function findDailyVerseRecipients(): Promise<UserToNotify[]> {
  const users = await db
    .select({
      userId: notificationPreferences.userId,
      dailyVerseTime: notificationPreferences.dailyVerseTime,
      timezone: notificationPreferences.timezone,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.dailyVerseEnabled, true));

  const toNotify: UserToNotify[] = [];
  for (const user of users) {
    const tz = user.timezone || "America/New_York";
    const currentTime = getCurrentTimeInTimezone(tz);
    if (currentTime === user.dailyVerseTime) {
      toNotify.push({
        userId: user.userId,
        type: "daily_verse",
        title: "Daily Verse",
        body: "Your daily verse is ready.",
        data: { screen: "home", type: "daily_verse" },
      });
    }
  }
  return toNotify;
}

export async function findStreakReminderRecipients(): Promise<UserToNotify[]> {
  const users = await db
    .select({
      userId: notificationPreferences.userId,
      timezone: notificationPreferences.timezone,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.readingStreakEnabled, true));

  const toNotify: UserToNotify[] = [];
  for (const user of users) {
    const tz = user.timezone || "America/New_York";
    const currentTime = getCurrentTimeInTimezone(tz);
    if (currentTime === "20:00") {
      toNotify.push({
        userId: user.userId,
        type: "streak_reminder",
        title: "Don't Break Your Streak",
        body: "Take a few minutes to read today and keep your streak alive.",
        data: { screen: "home", type: "streak_reminder" },
      });
    }
  }
  return toNotify;
}

// ─── Workflow: durable scheduled notification pipeline ───

export const notificationWorkflow = serve(
  async (context) => {
    const dailyVerseUsers = await context.run(
      "find-daily-verse-recipients",
      findDailyVerseRecipients,
    );

    const streakUsers = await context.run(
      "find-streak-reminder-recipients",
      findStreakReminderRecipients,
    );

    const allUsers = [...dailyVerseUsers, ...streakUsers];
    if (allUsers.length === 0) return;

    // Send notifications in parallel — each is an independent durable step
    await Promise.all(
      allUsers.map((user) =>
        context.run(`send-${user.type}-${user.userId}`, () =>
          sendToUser({
            userId: user.userId,
            title: user.title,
            body: user.body,
            data: user.data,
            sound: "default",
          }),
        ),
      ),
    );
  },
);
