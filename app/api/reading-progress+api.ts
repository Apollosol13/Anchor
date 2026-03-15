import { checkRateLimit, error, json, requireSession } from "@/lib/api-helpers";
import { db } from "@/server/db";
import { readingProgress } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const url = new URL(request.url);
    const book = url.searchParams.get("book");

    const conditions = [eq(readingProgress.userId, session.user.id)];
    if (book) conditions.push(eq(readingProgress.book, book));

    const data = await db
      .select({
        id: readingProgress.id,
        book: readingProgress.book,
        chapter: readingProgress.chapter,
        completedAt: readingProgress.completedAt,
      })
      .from(readingProgress)
      .where(and(...conditions));

    return json(data);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error fetching reading progress:", err);
    return error("Failed to fetch reading progress");
  }
}

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { book, chapter } = body;

    if (!book || chapter == null) {
      return error("Missing required fields: book, chapter", 400);
    }

    const [record] = await db
      .insert(readingProgress)
      .values({
        userId: session.user.id,
        book,
        chapter,
      })
      .onConflictDoNothing()
      .returning();

    return json(record ?? { book, chapter }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error saving reading progress:", err);
    return error("Failed to save reading progress");
  }
}

export async function DELETE(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { book, chapter } = body;

    if (!book || chapter == null) {
      return error("Missing required fields: book, chapter", 400);
    }

    await db
      .delete(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, session.user.id),
          eq(readingProgress.book, book),
          eq(readingProgress.chapter, chapter),
        ),
      );

    return json({ message: "Reading progress removed" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error removing reading progress:", err);
    return error("Failed to remove reading progress");
  }
}
