import { json } from "@/lib/api-helpers";

export async function GET() {
  return json({ status: "healthy", timestamp: new Date().toISOString() });
}
