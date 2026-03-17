import { db } from "@/server/db";
import { notificationPreferences, pushTokens } from "@/server/db/schema";
import { serve } from "@upstash/workflow";
import { eq } from "drizzle-orm";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const PUSH_TOKEN_PATTERN = /^Expo[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}$|^ExponentPushToken\[.+\]$/;
const CHUNK_SIZE = 100;

function isExpoPushToken(token: string): boolean {
  return PUSH_TOKEN_PATTERN.test(token);
}

interface ExpoPushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  details?: { error?: string };
  message?: string;
}

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

async function sendPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo Push API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data as ExpoPushTicket[];
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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
          .filter((token) => isExpoPushToken(token)),
      ),
    ];

    if (validTokens.length === 0) return false;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: notification.sound || "default",
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
    }));

    const chunks = chunkArray(messages, CHUNK_SIZE);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await sendPushNotifications(chunk);
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
        await db.delete(pushTokens).where(eq(pushTokens.pushToken, token));
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

function getCurrentTimeSlot(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
      10,
    );
    const roundedMinute = Math.floor(minute / 15) * 15;
    return `${hour}:${String(roundedMinute).padStart(2, "0")}`;
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
    const currentTime = getCurrentTimeSlot(tz);
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
    const currentTime = getCurrentTimeSlot(tz);
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

export const notificationWorkflow = serve(async (context) => {
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
});
