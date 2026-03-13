import { json, error } from "@/lib/api-helpers";
import { getAvailableVersions } from "@/server/services/bibleService";

export async function GET() {
  try {
    return json(getAvailableVersions());
  } catch (err) {
    return error("Failed to fetch Bible versions");
  }
}
