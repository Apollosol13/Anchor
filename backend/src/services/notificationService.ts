import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { supabase } from '../lib/supabase';

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
}

export class NotificationService {
  private expo: Expo;
  private sentLog = new Map<string, string>(); // userId:type -> "HH:MM" last sent

  constructor() {
    this.expo = new Expo();
  }

  private alreadySentThisMinute(userId: string, type: string, currentTime: string): boolean {
    const key = `${userId}:${type}`;
    if (this.sentLog.get(key) === currentTime) return true;
    this.sentLog.set(key, currentTime);
    if (this.sentLog.size > 10000) this.sentLog.clear();
    return false;
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(notification: PushNotification): Promise<boolean> {
    try {
      console.log(`🔔 Sending notification to user ${notification.userId}`);

      // Get user's push tokens
      const { data: tokens, error } = await supabase
        .from('push_tokens')
        .select('push_token, platform')
        .eq('user_id', notification.userId);

      if (error) {
        console.error('❌ Error fetching push tokens:', error);
        return false;
      }

      if (!tokens || tokens.length === 0) {
        console.log('⚠️ No push tokens found for user');
        return false;
      }

      // Filter valid Expo push tokens and deduplicate
      const validTokens = [...new Set(
        tokens
          .map(t => t.push_token)
          .filter(token => Expo.isExpoPushToken(token))
      )];

      if (validTokens.length === 0) {
        console.log('⚠️ No valid Expo push tokens');
        return false;
      }

      // Create messages
      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
      }));

      // Send notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`✅ Sent chunk of ${chunk.length} notifications`);
        } catch (error) {
          console.error('❌ Error sending notification chunk:', error);
        }
      }

      // Check for errors in tickets
      const hasErrors = tickets.some(
        ticket => ticket.status === 'error'
      );

      if (hasErrors) {
        console.warn('⚠️ Some notifications had errors');
        tickets.forEach(ticket => {
          if (ticket.status === 'error') {
            console.error('❌ Ticket error:', ticket.message);
          }
        });
      }

      return tickets.length > 0;
    } catch (error) {
      console.error('❌ Error in sendToUser:', error);
      return false;
    }
  }

  /**
   * Get current HH:MM in a given IANA timezone
   */
  private getCurrentTimeInTimezone(timezone: string): string {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now);

      const hour = parts.find(p => p.type === 'hour')?.value || '00';
      const minute = parts.find(p => p.type === 'minute')?.value || '00';
      return `${hour}:${minute}`;
    } catch {
      return '';
    }
  }

  /**
   * Send daily verse notification to all users who have it enabled.
   * Compares each user's scheduled time against the current time in their timezone.
   */
  async sendDailyVerseNotifications(): Promise<{ sent: number; failed: number }> {
    try {
      const { data: users, error } = await supabase
        .from('notification_preferences')
        .select('user_id, daily_verse_time, timezone')
        .eq('daily_verse_enabled', true);

      if (error) {
        console.error('❌ Error fetching notification preferences:', error);
        return { sent: 0, failed: 0 };
      }

      if (!users || users.length === 0) {
        return { sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const user of users) {
        const tz = user.timezone || 'America/New_York';
        const currentTimeInUserTz = this.getCurrentTimeInTimezone(tz);

        if (currentTimeInUserTz !== user.daily_verse_time) continue;
        if (this.alreadySentThisMinute(user.user_id, 'daily_verse', currentTimeInUserTz)) continue;

        const success = await this.sendToUser({
          userId: user.user_id,
          title: 'Daily Verse',
          body: 'Your daily verse is ready.',
          data: { screen: 'home', type: 'daily_verse' },
          sound: 'default',
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (sent > 0 || failed > 0) {
        console.log(`✅ Daily verse notifications: ${sent} sent, ${failed} failed`);
      }
      return { sent, failed };
    } catch (error) {
      console.error('❌ Error sending daily verse notifications:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send streak reminders to all users at 8 PM their timezone.
   */
  async sendStreakReminders(): Promise<{ sent: number; failed: number }> {
    try {
      const { data: users, error } = await supabase
        .from('notification_preferences')
        .select('user_id, timezone')
        .eq('reading_streak_enabled', true);

      if (error || !users || users.length === 0) {
        return { sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const user of users) {
        const tz = user.timezone || 'America/New_York';
        const currentTimeInUserTz = this.getCurrentTimeInTimezone(tz);

        if (currentTimeInUserTz !== '20:00') continue;
        if (this.alreadySentThisMinute(user.user_id, 'streak', currentTimeInUserTz)) continue;

        const success = await this.sendToUser({
          userId: user.user_id,
          title: "Don't Break Your Streak",
          body: "Take a few minutes to read today and keep your streak alive.",
          data: { screen: 'home', type: 'streak_reminder' },
          sound: 'default',
        });

        if (success) sent++;
        else failed++;

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (sent > 0 || failed > 0) {
        console.log(`Streak reminders: ${sent} sent, ${failed} failed`);
      }
      return { sent, failed };
    } catch (error) {
      console.error('Error sending streak reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(userId: string): Promise<boolean> {
    return this.sendToUser({
      userId,
      title: 'Test Notification',
      body: 'This is a test notification from Anchor.',
      data: { type: 'test' },
      sound: 'default',
    });
  }
}

export const notificationService = new NotificationService();
