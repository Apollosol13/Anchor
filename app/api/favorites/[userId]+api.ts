import { checkRateLimit, error, json, requireSession } from "@/lib/api-helpers";
import { db } from "@/server/db";
import { favorites } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request, { userId }: { userId: string }) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);

    // Users can only fetch their own favorites
    if (session.user.id !== userId) {
      return error("Forbidden", 403);
    }

    const data = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return json(data);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error fetching favorites:", err);
    return error("Failed to fetch favorites");
  }
}

export async function DELETE(request: Request, { userId }: { userId: string }) {
  try {
    await checkRateLimit(request);
    await requireSession(request);
    // userId param here acts as the favorite ID for DELETE
    await db.delete(favorites).where(eq(favorites.id, userId));
    return json({ message: "Favorite removed successfully" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error removing favorite:", err);
    return error("Failed to remove favorite");
  }
}
