import { auth } from "./auth";
import { globalRateLimit } from "./rate-limit";

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function error(message: string, status = 500) {
  return json({ error: message }, status);
}

export async function getSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
}

export async function requireSession(request: Request) {
  const session = await getSession(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function checkRateLimit(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { success } = await globalRateLimit.limit(ip);
  if (!success) {
    throw new Response(
      JSON.stringify({
        error: "Too many requests from this IP, please try again later.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }
}
