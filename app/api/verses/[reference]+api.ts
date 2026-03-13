import { json, error, checkRateLimit } from "@/lib/api-helpers";
import { getVerse } from "@/server/services/bibleService";

export async function GET(
  request: Request,
  { reference }: { reference: string },
) {
  try {
    await checkRateLimit(request);
    const url = new URL(request.url);
    const version = url.searchParams.get("version") || "WEB";

    const verse = await getVerse(reference, version);
    return json(verse);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error fetching verse:", err);
    return error("Failed to fetch verse");
  }
}
