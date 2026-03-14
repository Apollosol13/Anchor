import { json, error, checkRateLimit } from "@/lib/api-helpers";
import { getVerseOfTheDay } from "@/server/services/bibleService";

export async function GET(request: Request) {
  try {
    await checkRateLimit(request);
    const url = new URL(request.url);
    const version = url.searchParams.get("version") || "WEB";
    const date = url.searchParams.get("date") || undefined;
    const timezone = url.searchParams.get("timezone") || undefined;

    const verse = await getVerseOfTheDay(version, date, timezone);
    return json(verse);
  } catch (err) {
    if (err instanceof Response) return err;
    // Empty verse library is expected before seeding
    if (err instanceof Error && err.message.startsWith("No verses found")) {
      return json(null);
    }
    console.error("Error fetching verse of the day:", err);
    return error("Failed to fetch verse of the day");
  }
}
