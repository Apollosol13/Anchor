import { json, error, requireSession, checkRateLimit } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return error("filename and contentType are required", 400);
    }

    const ext = filename.split(".").pop() || "jpg";
    const key = `user-uploads/${session.user.id}/${Date.now()}.${ext}`;

    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(
      key,
      contentType,
    );

    return json({ uploadUrl, publicUrl });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error generating presigned URL:", err);
    return error("Failed to generate upload URL");
  }
}
