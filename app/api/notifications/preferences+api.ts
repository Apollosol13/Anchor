import { checkRateLimit, error, json, requireSession } from '@/lib/api-helpers';
import { db } from '@/server/db';
import { notificationPreferences } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, session.user.id))
      .limit(1);

    if (!prefs) {
      // Create defaults so the workflow can find this user
      const [created] = await db
        .insert(notificationPreferences)
        .values({
          userId: session.user.id,
          dailyVerseEnabled: true,
          dailyVerseTime: '09:00',
          timezone: 'America/New_York',
          readingStreakEnabled: true,
          chapterCompletionEnabled: true,
        })
        .onConflictDoNothing()
        .returning();

      return json(created ?? {
        dailyVerseEnabled: true,
        dailyVerseTime: '09:00',
        timezone: 'America/New_York',
        readingStreakEnabled: true,
        chapterCompletionEnabled: true,
      });
    }

    return json(prefs);
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to fetch notification preferences');
  }
}

export async function PUT(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();

    const [prefs] = await db
      .insert(notificationPreferences)
      .values({
        userId: session.user.id,
        dailyVerseEnabled: body.dailyVerseEnabled ?? true,
        dailyVerseTime: body.dailyVerseTime ?? '09:00',
        timezone: body.timezone ?? 'America/New_York',
        readingStreakEnabled: body.readingStreakEnabled ?? true,
        chapterCompletionEnabled: body.chapterCompletionEnabled ?? true,
      })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          dailyVerseEnabled: body.dailyVerseEnabled,
          dailyVerseTime: body.dailyVerseTime,
          timezone: body.timezone,
          readingStreakEnabled: body.readingStreakEnabled,
          chapterCompletionEnabled: body.chapterCompletionEnabled,
          updatedAt: new Date(),
        },
      })
      .returning();

    return json(prefs);
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to update notification preferences');
  }
}
