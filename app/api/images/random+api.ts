import { json, error, checkRateLimit } from '@/lib/api-helpers';
import { getRandomPreset } from '@/server/services/imageService';

export async function GET(request: Request) {
  try {
    await checkRateLimit(request);
    const preset = await getRandomPreset();
    if (!preset) return error('No presets available', 404);
    return json(preset);
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to fetch random preset');
  }
}
