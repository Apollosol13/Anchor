import { error, json } from "@/lib/api-helpers";
import { getAvailableVersions } from "@/server/services/bibleService";

export async function GET() {
  try {
    return json(getAvailableVersions());
  } catch {
    return error("Failed to fetch Bible versions");
  }
}
