import { checkRateLimit, error, json, requireSession } from '@/lib/api-helpers';
import { db } from '@/server/db';
import { favorites } from '@/server/db/schema';

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { book, chapter, verse, version, text } = body;

    if (!book || !chapter || !verse || !version || !text) {
      return error('Missing required fields', 400);
    }

    try {
      const [favorite] = await db
        .insert(favorites)
        .values({
          userId: session.user.id,
          book,
          chapter,
          verse,
          version,
          text,
        })
        .returning();

      return json(favorite, 201);
    } catch (err: any) {
      if (err.code === '23505') {
        return error('Verse already in favorites', 409);
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error adding favorite:', err);
    return error('Failed to add favorite');
  }
}
