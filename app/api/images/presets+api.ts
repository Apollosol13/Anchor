import { json, error, checkRateLimit } from '@/lib/api-helpers';
import { getPresets, createPreset } from '@/server/services/imageService';

export async function GET(request: Request) {
  try {
    await checkRateLimit(request);
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const data = await getPresets(category);
    return json(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to fetch image presets');
  }
}

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const body = await request.json();
    const preset = await createPreset(body);
    return json(preset, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to create preset');
  }
}
