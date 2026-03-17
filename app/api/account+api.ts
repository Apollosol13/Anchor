import { checkRateLimit, error, json, requireSession } from "@/lib/api-helpers";
import { db } from "@/server/db";
import {
  favorites,
  readingProgress,
  pushTokens,
  notificationPreferences,
  userProfiles,
  userPreferences,
  aiChatUsage,
  session as sessionTable,
  account as accountTable,
  user as userTable,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const userId = session.user.id;

    // Delete all user data (cascade handles Better Auth tables via FK,
    // but we delete explicitly for tables without cascade)
    await db.delete(aiChatUsage).where(eq(aiChatUsage.userId, userId));
    await db.delete(favorites).where(eq(favorites.userId, userId));
    await db.delete(readingProgress).where(eq(readingProgress.userId, userId));
    await db.delete(pushTokens).where(eq(pushTokens.userId, userId));
    await db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await db.delete(userPreferences).where(eq(userPreferences.userId, userId));

    // Delete Better Auth data (sessions, accounts, then user)
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
    await db.delete(accountTable).where(eq(accountTable.userId, userId));
    await db.delete(userTable).where(eq(userTable.id, userId));

    return json({ message: "Account deleted successfully" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error deleting account:", err);
    return error("Failed to delete account");
  }
}
