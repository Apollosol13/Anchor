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

  constructor() {
    this.expo = new Expo();
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

      // Filter valid Expo push tokens
      const validTokens = tokens
        .map(t => t.push_token)
        .filter(token => Expo.isExpoPushToken(token));

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
   * Send daily verse notification to all users who have it enabled
   */
  async sendDailyVerseNotifications(): Promise<{ sent: number; failed: number }> {
    try {
      console.log('📖 Starting daily verse notification batch...');

      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      console.log(`⏰ Current time: ${currentTime}`);

      // Get users who should receive notifications now
      const { data: users, error } = await supabase
        .from('notification_preferences')
        .select('user_id, daily_verse_time')
        .eq('daily_verse_enabled', true)
        .eq('daily_verse_time', currentTime);

      if (error) {
        console.error('❌ Error fetching notification preferences:', error);
        return { sent: 0, failed: 0 };
      }

      if (!users || users.length === 0) {
        console.log(`⚠️ No users scheduled for ${currentTime}`);
        return { sent: 0, failed: 0 };
      }

      console.log(`📬 Found ${users.length} users to notify`);

      let sent = 0;
      let failed = 0;

      // Send notifications to each user
      for (const user of users) {
        const success = await this.sendToUser({
          userId: user.user_id,
          title: 'Daily Verse',
          body: 'Your daily verse is ready! 📖',
          data: { screen: 'home', type: 'daily_verse' },
          sound: 'default',
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Daily verse notifications complete: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('❌ Error sending daily verse notifications:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send chapter completion notification
   */
  async sendChapterCompletion(
    userId: string, 
    bookName: string, 
    chapter: number
  ): Promise<boolean> {
    return this.sendToUser({
      userId,
      title: 'Chapter Complete! 🎉',
      body: `Great job finishing ${bookName} ${chapter}!`,
      data: { 
        screen: 'bible', 
        type: 'chapter_completion',
        book: bookName,
        chapter 
      },
      sound: 'default',
    });
  }

  /**
   * Send reading streak reminder
   */
  async sendStreakReminder(userId: string, streakDays: number): Promise<boolean> {
    return this.sendToUser({
      userId,
      title: "Don't Break Your Streak! 🔥",
      body: `You're on a ${streakDays}-day reading streak. Keep it going!`,
      data: { 
        screen: 'home', 
        type: 'streak_reminder',
        streakDays 
      },
      sound: 'default',
    });
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(userId: string): Promise<boolean> {
    return this.sendToUser({
      userId,
      title: 'Test Notification',
      body: 'This is a test notification from Anchor Bible App 🎯',
      data: { type: 'test' },
      sound: 'default',
    });
  }
}

export const notificationService = new NotificationService();
