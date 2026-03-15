import { db } from "@/server/db";
import { verseLibrary, verseOfTheDay } from "@/server/db/schema";
import { and, count, eq } from "drizzle-orm";

interface BibleVerse {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
}

const BIBLE_API_BASE = "https://rest.api.bible/v1";

const THEME_MAP: Record<number, string> = {
  0: "rest",
  1: "strength",
  2: "peace",
  3: "wisdom",
  4: "love",
  5: "faith",
  6: "joy",
};

const VERSION_MAP: Record<string, string> = {
  WEB: "9879dbb7cfe39e4d-02",
  KJV: "de4e12af7f28f599-02",
  ASV: "06125adad2d5898a-01",
  FBV: "65eec8e0b60e656b-01",
  NLT: "d6e14a625393b4da-01",
};

const BOOK_MAP: Record<string, string> = {
  Genesis: "GEN",
  Exodus: "EXO",
  Leviticus: "LEV",
  Numbers: "NUM",
  Deuteronomy: "DEU",
  Joshua: "JOS",
  Judges: "JDG",
  Ruth: "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  "Song of Solomon": "SNG",
  Isaiah: "ISA",
  Jeremiah: "JER",
  Lamentations: "LAM",
  Ezekiel: "EZK",
  Daniel: "DAN",
  Hosea: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obadiah: "OBA",
  Jonah: "JON",
  Micah: "MIC",
  Nahum: "NAM",
  Habakkuk: "HAB",
  Zephaniah: "ZEP",
  Haggai: "HAG",
  Zechariah: "ZEC",
  Malachi: "MAL",
  Matthew: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Romans: "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  Jude: "JUD",
  Revelation: "REV",
};

function getVersionId(version: string): string {
  return VERSION_MAP[version.toUpperCase()] || VERSION_MAP.WEB;
}

function getBookCode(bookName: string): string {
  return BOOK_MAP[bookName] || "GEN";
}

function hashDateSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const apiKey = process.env.BIBLE_API_KEY || "";

async function apiFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BIBLE_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { "api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Bible API error: ${res.status}`);
  return res.json();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/^\d+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getVerseOfTheDay(
  version = "WEB",
  userDate?: string,
  timezone?: string,
): Promise<BibleVerse> {
  try {
    let dateStr: string;
    let today: Date;

    if (userDate) {
      dateStr = userDate;
      today = new Date(userDate + "T00:00:00");
    } else if (timezone) {
      today = new Date(
        new Date().toLocaleString("en-US", { timeZone: timezone }),
      );
      today.setHours(0, 0, 0, 0);
      dateStr = today.toISOString().split("T")[0];
    } else {
      today = new Date();
      today.setHours(0, 0, 0, 0);
      dateStr = today.toISOString().split("T")[0];
    }

    // Check cache
    const [cached] = await db
      .select()
      .from(verseOfTheDay)
      .where(
        and(
          eq(verseOfTheDay.date, dateStr),
          eq(verseOfTheDay.version, version),
        ),
      )
      .limit(1);

    if (cached) {
      return {
        text: cached.text,
        reference: `${cached.book} ${cached.chapter}:${cached.verse}`,
        book: cached.book,
        chapter: cached.chapter,
        verse: cached.verse,
        version: cached.version,
      };
    }

    // Get theme and select verse from library
    const theme = THEME_MAP[today.getDay()];

    // Count verses for this theme
    const [countResult] = await db
      .select({ total: count() })
      .from(verseLibrary)
      .where(eq(verseLibrary.theme, theme));

    const total = countResult?.total ?? 0;
    if (total === 0) throw new Error(`No verses found for theme: ${theme}`);

    const offset = hashDateSeed(dateStr) % total;

    const [verseData] = await db
      .select()
      .from(verseLibrary)
      .where(eq(verseLibrary.theme, theme))
      .offset(offset)
      .limit(1);

    if (!verseData) throw new Error("Failed to select verse from library");

    // Fetch full text from Bible API
    const verse = await getVerse(verseData.referenceCode, version);

    // Cache (use onConflictDoNothing to handle concurrent requests gracefully)
    await db.insert(verseOfTheDay).values({
      date: dateStr,
      book: verseData.book,
      chapter: verseData.chapter,
      verse: verseData.verse,
      version,
      text: verse.text,
    }).onConflictDoNothing();

    return verse;
  } catch (error) {
    console.error("Error fetching verse of the day:", error);
    return {
      text: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
      reference: "John 3:16",
      book: "John",
      chapter: 3,
      verse: 16,
      version: "WEB",
    };
  }
}

export async function getChapter(
  bookName: string,
  chapter: number,
  version = "WEB",
) {
  const bibleId = getVersionId(version);
  const bookCode = getBookCode(bookName);
  const chapterId = `${bookCode}.${chapter}`;

  const chapterRes = await apiFetch(
    `/bibles/${bibleId}/chapters/${chapterId}`,
    { "content-type": "html" },
  );

  const html: string = chapterRes.data.content || "";
  const verseParts = html.split(
    /<span[^>]*data-number="(\d+)"[^>]*class="v"[^>]*>\d+<\/span>/,
  );

  const verses: { number: number; text: string }[] = [];
  for (let i = 1; i < verseParts.length; i += 2) {
    const verseNumber = parseInt(verseParts[i]);
    const text = stripHtml(verseParts[i + 1] || "");
    if (verseNumber > 0 && text) {
      verses.push({ number: verseNumber, text });
    }
  }

  // Fallback to individual verse fetch
  if (verses.length === 0) {
    const listRes = await apiFetch(
      `/bibles/${bibleId}/chapters/${chapterId}/verses`,
    );
    const fetches = listRes.data.map(async (meta: any) => {
      const verseNumber = parseInt(meta.id.split(".").pop() || "0");
      try {
        const vRes = await apiFetch(`/bibles/${bibleId}/verses/${meta.id}`, {
          "content-type": "html",
        });
        return {
          number: verseNumber,
          text: stripHtml(vRes.data.content || ""),
        };
      } catch {
        return null;
      }
    });
    const results = await Promise.all(fetches);
    verses.push(
      ...results.filter(
        (v): v is { number: number; text: string } => v !== null,
      ),
    );
  }

  return { verses, reference: `${bookName} ${chapter}`, version };
}

export async function getVerse(
  reference: string,
  version = "WEB",
): Promise<BibleVerse> {
  const bibleId = getVersionId(version);
  const res = await apiFetch(`/bibles/${bibleId}/verses/${reference}`, {
    "content-type": "html",
  });

  const data = res.data;
  const text = stripHtml(data.content || "");

  return {
    text,
    reference: data.reference,
    book: data.reference.split(" ")[0],
    chapter: parseInt(data.reference.match(/\d+/)?.[0] || "0"),
    verse: parseInt(data.reference.match(/:(\d+)/)?.[1] || "0"),
    version,
  };
}

export async function searchVerses(
  query: string,
  version = "WEB",
  limit = 10,
): Promise<BibleVerse[]> {
  const bibleId = getVersionId(version);
  const res = await apiFetch(`/bibles/${bibleId}/search`, {
    query,
    limit: String(limit),
    "content-type": "html",
  });

  const verses = res.data?.verses;
  if (!Array.isArray(verses)) return [];

  return verses.map((v: any) => ({
    text: stripHtml(v.text || ""),
    reference: v.reference || "",
    book: (v.reference || "").split(" ")[0],
    chapter: parseInt((v.reference || "").match(/\d+/)?.[0] || "0"),
    verse: parseInt((v.reference || "").match(/:(\d+)/)?.[1] || "0"),
    version,
  }));
}

export function getAvailableVersions() {
  return [
    { id: "WEB", name: "World English Bible", abbreviation: "WEB" },
    { id: "KJV", name: "King James Version", abbreviation: "KJV" },
    { id: "ASV", name: "American Standard Version", abbreviation: "ASV" },
    { id: "FBV", name: "Free Bible Version", abbreviation: "FBV" },
    { id: "NLT", name: "New Living Translation", abbreviation: "NLT" },
  ];
}
