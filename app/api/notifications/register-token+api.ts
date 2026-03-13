import { checkRateLimit, error, json, requireSession } from '@/lib/api-helpers';
import { db } from '@/server/db';
import { pushTokens } from '@/server/db/schema';

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { token, platform } = body;

    if (!token || !platform) {
      return error('Token and platform are required', 400);
    }

    if (!['ios', 'android'].includes(platform)) {
      return error('Platform must be ios or android', 400);
    }

    // Upsert: update token if user+platform exists, insert otherwise
    await db
      .insert(pushTokens)
      .values({
        userId: session.user.id,
        pushToken: token,
        platform,
      })
      .onConflictDoUpdate({
        target: pushTokens.pushToken,
        set: {
          userId: session.user.id,
          platform,
          updatedAt: new Date(),
        },
      });

    return json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error registering push token:', err);
    return error('Failed to register push token');
  }
}
