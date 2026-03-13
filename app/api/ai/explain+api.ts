import { checkRateLimit, error, json, requireSession } from '@/lib/api-helpers';
import { db } from '@/server/db';
import { aiChatUsage } from '@/server/db/schema';
import { explainVerse } from '@/server/services/openaiService';
import { and, eq, sql } from 'drizzle-orm';

const RATE_LIMITS = { free: 10, pro: 100 };

async function checkAiRateLimit(userId: string, isPro: boolean) {
  const today = new Date().toISOString().split('T')[0];
  const limit = isPro ? RATE_LIMITS.pro : RATE_LIMITS.free;

  // Get today's usage
  const [usage] = await db
    .select()
    .from(aiChatUsage)
    .where(and(eq(aiChatUsage.userId, userId), eq(aiChatUsage.lastResetDate, today)))
    .limit(1);

  const currentCount = usage?.messageCount ?? 0;

  if (currentCount >= limit) {
    const tierName = isPro ? 'Pro' : 'Free';
    return {
      allowed: false,
      response: error(
        `You've reached your ${tierName} tier limit of ${limit} messages per day. ${isPro ? 'Try again tomorrow!' : 'Upgrade to Pro for 100 messages per day.'}`,
        429
      ),
    };
  }

  // Increment usage (upsert)
  await db
    .insert(aiChatUsage)
    .values({ userId, messageCount: 1, lastResetDate: today })
    .onConflictDoUpdate({
      target: [aiChatUsage.userId, aiChatUsage.lastResetDate],
      set: {
        messageCount: sql`${aiChatUsage.messageCount} + 1`,
        updatedAt: sql`now()`,
      },
    });

  return {
    allowed: true,
    usageInfo: {
      currentUsage: currentCount + 1,
      dailyLimit: limit,
      remainingMessages: limit - (currentCount + 1),
    },
  };
}

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { verse, reference, isPro = false } = body;

    if (!verse || !reference) {
      return error('Verse and reference are required', 400);
    }

    const rateCheck = await checkAiRateLimit(session.user.id, isPro);
    if (!rateCheck.allowed) return rateCheck.response!;

    const explanation = await explainVerse(verse, reference);
    return json({ explanation, usage: rateCheck.usageInfo });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error explaining verse:', err);
    return error('Failed to generate explanation');
  }
}
