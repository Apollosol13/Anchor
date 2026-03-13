import { json, error, checkRateLimit } from '@/lib/api-helpers';
import { getChapter } from '@/server/services/bibleService';

export async function GET(
  request: Request,
  { bookName, chapter }: { bookName: string; chapter: string }
) {
  try {
    await checkRateLimit(request);
    const url = new URL(request.url);
    const version = url.searchParams.get('version') || 'WEB';

    const chapterData = await getChapter(bookName, parseInt(chapter), version);
    return json(chapterData);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error fetching chapter:', err);
    return error('Failed to fetch chapter');
  }
}
