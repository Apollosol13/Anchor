import { json, error, checkRateLimit } from "@/lib/api-helpers";
import { deletePreset } from "@/server/services/imageService";

export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    await checkRateLimit(request);
    await deletePreset(id);
    return json({ message: "Preset deleted successfully" });
  } catch (err) {
    if (err instanceof Response) return err;
    return error("Failed to delete preset");
  }
}
