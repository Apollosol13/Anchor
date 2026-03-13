import { json, error, checkRateLimit } from "@/lib/api-helpers";
import { searchVerses } from "@/server/services/bibleService";

export async function GET(request: Request, { query }: { query: string }) {
  try {
    await checkRateLimit(request);
    const url = new URL(request.url);
    const version = url.searchParams.get("version") || "WEB";
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const results = await searchVerses(query, version, limit);
    return json(results);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error searching verses:", err);
    return error("Failed to search verses");
  }
}
