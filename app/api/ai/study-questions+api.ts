import { checkRateLimit, error, json, requireSession } from '@/lib/api-helpers';
import { db } from '@/server/db';
import { aiChatUsage } from '@/server/db/schema';
import { generateStudyQuestions } from '@/server/services/openaiService';
import { and, eq, sql } from 'drizzle-orm';

const RATE_LIMITS = { free: 10, pro: 100 };

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { verse, reference, isPro = false } = body;

    if (!verse || !reference) {
      return error('Verse and reference are required', 400);
    }

    const today = new Date().toISOString().split('T')[0];
    const limit = isPro ? RATE_LIMITS.pro : RATE_LIMITS.free;

    const [usage] = await db
      .select()
      .from(aiChatUsage)
      .where(and(eq(aiChatUsage.userId, session.user.id), eq(aiChatUsage.lastResetDate, today)))
      .limit(1);

    const currentCount = usage?.messageCount ?? 0;
    if (currentCount >= limit) {
      return error('Rate limit exceeded', 429);
    }

    await db
      .insert(aiChatUsage)
      .values({ userId: session.user.id, messageCount: 1, lastResetDate: today })
      .onConflictDoUpdate({
        target: [aiChatUsage.userId, aiChatUsage.lastResetDate],
        set: {
          messageCount: sql`${aiChatUsage.messageCount} + 1`,
          updatedAt: sql`now()`,
        },
      });

    const questions = await generateStudyQuestions(verse, reference);
    return json({
      questions,
      usage: {
        currentUsage: currentCount + 1,
        dailyLimit: limit,
        remainingMessages: limit - (currentCount + 1),
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error generating study questions:', err);
    return error('Failed to generate study questions');
  }
}
