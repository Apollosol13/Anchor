import { checkRateLimit, error, json, requireSession } from "@/lib/api-helpers";
import { uploadFile } from "@/server/r2";
import { db } from "@/server/db";
import { chapterAudio } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

const AUDIO_FORMAT_VERSION = "v2_no_verse_numbers";

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    await requireSession(request);
    const body = await request.json();
    const { verses, bookName, chapter, version } = body;

    if (!verses || !Array.isArray(verses) || verses.length === 0) {
      return error("Verses array is required and must not be empty", 400);
    }

    // Check cache
    const [cached] = await db
      .select()
      .from(chapterAudio)
      .where(
        and(
          eq(chapterAudio.bookName, bookName),
          eq(chapterAudio.chapter, chapter),
          eq(chapterAudio.version, version),
        ),
      )
      .limit(1);

    if (cached && cached.formatVersion === AUDIO_FORMAT_VERSION) {
      return json({
        audioUrl: cached.audioUrl,
        duration: cached.duration,
        verseCount: verses.length,
        cached: true,
      });
    }

    // Generate audio with OpenAI TTS
    const introText = `${bookName}, chapter ${chapter}.`;
    const versesText = verses.map((v: any) => v.text || "").join(" ");
    const chapterText = `${introText} ${versesText}`;

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: "onyx",
        input: chapterText,
        speed: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
      return error("Failed to generate audio", response.status);
    }

    const audioBuffer = await response.arrayBuffer();
    const approximateDuration = Math.round(audioBuffer.byteLength / 3000);

    // Upload to R2
    const key = `chapter-audio/${bookName.toLowerCase()}_${chapter}_${version.toLowerCase()}.mp3`;
    const audioUrl = await uploadFile(key, audioBuffer, "audio/mpeg");

    // Cache in database
    await db
      .insert(chapterAudio)
      .values({
        bookName,
        chapter,
        version,
        audioUrl,
        duration: approximateDuration,
        formatVersion: AUDIO_FORMAT_VERSION,
      })
      .onConflictDoUpdate({
        target: [
          chapterAudio.bookName,
          chapterAudio.chapter,
          chapterAudio.version,
        ],
        set: {
          audioUrl,
          duration: approximateDuration,
          formatVersion: AUDIO_FORMAT_VERSION,
          generatedAt: new Date(),
        },
      });

    return json({
      audioUrl,
      duration: approximateDuration,
      verseCount: verses.length,
      cached: false,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("Error generating audio:", err);
    return error("Failed to generate audio");
  }
}
