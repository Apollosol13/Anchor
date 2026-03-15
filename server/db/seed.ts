import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { verseLibrary, imagePresets } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Verse Library: theme-tagged verse references ───
// These are picked by getVerseOfTheDay based on day-of-week → theme mapping:
//   Sun=rest, Mon=strength, Tue=peace, Wed=wisdom, Thu=love, Fri=faith, Sat=joy

const verses: { book: string; chapter: number; verse: number; referenceCode: string; theme: string }[] = [
  // ── rest (Sunday) ──
  { book: "Matthew", chapter: 11, verse: 28, referenceCode: "MAT.11.28", theme: "rest" },
  { book: "Psalms", chapter: 23, verse: 1, referenceCode: "PSA.23.1", theme: "rest" },
  { book: "Psalms", chapter: 46, verse: 10, referenceCode: "PSA.46.10", theme: "rest" },
  { book: "Exodus", chapter: 33, verse: 14, referenceCode: "EXO.33.14", theme: "rest" },
  { book: "Isaiah", chapter: 40, verse: 31, referenceCode: "ISA.40.31", theme: "rest" },
  { book: "Psalms", chapter: 91, verse: 1, referenceCode: "PSA.91.1", theme: "rest" },
  { book: "Psalms", chapter: 62, verse: 1, referenceCode: "PSA.62.1", theme: "rest" },
  { book: "Jeremiah", chapter: 6, verse: 16, referenceCode: "JER.6.16", theme: "rest" },
  { book: "Hebrews", chapter: 4, verse: 9, referenceCode: "HEB.4.9", theme: "rest" },
  { book: "Psalms", chapter: 127, verse: 2, referenceCode: "PSA.127.2", theme: "rest" },

  // ── strength (Monday) ──
  { book: "Philippians", chapter: 4, verse: 13, referenceCode: "PHP.4.13", theme: "strength" },
  { book: "Isaiah", chapter: 41, verse: 10, referenceCode: "ISA.41.10", theme: "strength" },
  { book: "Deuteronomy", chapter: 31, verse: 6, referenceCode: "DEU.31.6", theme: "strength" },
  { book: "Joshua", chapter: 1, verse: 9, referenceCode: "JOS.1.9", theme: "strength" },
  { book: "2 Timothy", chapter: 1, verse: 7, referenceCode: "2TI.1.7", theme: "strength" },
  { book: "Psalms", chapter: 27, verse: 1, referenceCode: "PSA.27.1", theme: "strength" },
  { book: "Nehemiah", chapter: 8, verse: 10, referenceCode: "NEH.8.10", theme: "strength" },
  { book: "Psalms", chapter: 73, verse: 26, referenceCode: "PSA.73.26", theme: "strength" },
  { book: "Ephesians", chapter: 6, verse: 10, referenceCode: "EPH.6.10", theme: "strength" },
  { book: "2 Corinthians", chapter: 12, verse: 9, referenceCode: "2CO.12.9", theme: "strength" },

  // ── peace (Tuesday) ──
  { book: "John", chapter: 14, verse: 27, referenceCode: "JHN.14.27", theme: "peace" },
  { book: "Philippians", chapter: 4, verse: 7, referenceCode: "PHP.4.7", theme: "peace" },
  { book: "Isaiah", chapter: 26, verse: 3, referenceCode: "ISA.26.3", theme: "peace" },
  { book: "Romans", chapter: 15, verse: 13, referenceCode: "ROM.15.13", theme: "peace" },
  { book: "Psalms", chapter: 29, verse: 11, referenceCode: "PSA.29.11", theme: "peace" },
  { book: "Colossians", chapter: 3, verse: 15, referenceCode: "COL.3.15", theme: "peace" },
  { book: "Numbers", chapter: 6, verse: 26, referenceCode: "NUM.6.26", theme: "peace" },
  { book: "Psalms", chapter: 34, verse: 14, referenceCode: "PSA.34.14", theme: "peace" },
  { book: "Matthew", chapter: 5, verse: 9, referenceCode: "MAT.5.9", theme: "peace" },
  { book: "Romans", chapter: 8, verse: 6, referenceCode: "ROM.8.6", theme: "peace" },

  // ── wisdom (Wednesday) ──
  { book: "Proverbs", chapter: 3, verse: 5, referenceCode: "PRO.3.5", theme: "wisdom" },
  { book: "James", chapter: 1, verse: 5, referenceCode: "JAS.1.5", theme: "wisdom" },
  { book: "Proverbs", chapter: 9, verse: 10, referenceCode: "PRO.9.10", theme: "wisdom" },
  { book: "Proverbs", chapter: 2, verse: 6, referenceCode: "PRO.2.6", theme: "wisdom" },
  { book: "Colossians", chapter: 2, verse: 3, referenceCode: "COL.2.3", theme: "wisdom" },
  { book: "Psalms", chapter: 111, verse: 10, referenceCode: "PSA.111.10", theme: "wisdom" },
  { book: "Proverbs", chapter: 16, verse: 16, referenceCode: "PRO.16.16", theme: "wisdom" },
  { book: "Ecclesiastes", chapter: 7, verse: 12, referenceCode: "ECC.7.12", theme: "wisdom" },
  { book: "Proverbs", chapter: 4, verse: 7, referenceCode: "PRO.4.7", theme: "wisdom" },
  { book: "Proverbs", chapter: 19, verse: 20, referenceCode: "PRO.19.20", theme: "wisdom" },

  // ── love (Thursday) ──
  { book: "John", chapter: 3, verse: 16, referenceCode: "JHN.3.16", theme: "love" },
  { book: "1 Corinthians", chapter: 13, verse: 4, referenceCode: "1CO.13.4", theme: "love" },
  { book: "1 John", chapter: 4, verse: 19, referenceCode: "1JN.4.19", theme: "love" },
  { book: "Romans", chapter: 8, verse: 38, referenceCode: "ROM.8.38", theme: "love" },
  { book: "1 Corinthians", chapter: 16, verse: 14, referenceCode: "1CO.16.14", theme: "love" },
  { book: "1 John", chapter: 4, verse: 8, referenceCode: "1JN.4.8", theme: "love" },
  { book: "Ephesians", chapter: 4, verse: 2, referenceCode: "EPH.4.2", theme: "love" },
  { book: "1 Peter", chapter: 4, verse: 8, referenceCode: "1PE.4.8", theme: "love" },
  { book: "Psalms", chapter: 136, verse: 1, referenceCode: "PSA.136.1", theme: "love" },
  { book: "Romans", chapter: 5, verse: 8, referenceCode: "ROM.5.8", theme: "love" },

  // ── faith (Friday) ──
  { book: "Hebrews", chapter: 11, verse: 1, referenceCode: "HEB.11.1", theme: "faith" },
  { book: "Romans", chapter: 10, verse: 17, referenceCode: "ROM.10.17", theme: "faith" },
  { book: "2 Corinthians", chapter: 5, verse: 7, referenceCode: "2CO.5.7", theme: "faith" },
  { book: "Mark", chapter: 11, verse: 24, referenceCode: "MRK.11.24", theme: "faith" },
  { book: "Hebrews", chapter: 11, verse: 6, referenceCode: "HEB.11.6", theme: "faith" },
  { book: "Galatians", chapter: 2, verse: 20, referenceCode: "GAL.2.20", theme: "faith" },
  { book: "Matthew", chapter: 17, verse: 20, referenceCode: "MAT.17.20", theme: "faith" },
  { book: "Romans", chapter: 1, verse: 17, referenceCode: "ROM.1.17", theme: "faith" },
  { book: "Ephesians", chapter: 2, verse: 8, referenceCode: "EPH.2.8", theme: "faith" },
  { book: "1 Peter", chapter: 1, verse: 21, referenceCode: "1PE.1.21", theme: "faith" },

  // ── joy (Saturday) ──
  { book: "Psalms", chapter: 16, verse: 11, referenceCode: "PSA.16.11", theme: "joy" },
  { book: "Nehemiah", chapter: 8, verse: 10, referenceCode: "NEH.8.10", theme: "joy" },
  { book: "Romans", chapter: 15, verse: 13, referenceCode: "ROM.15.13", theme: "joy" },
  { book: "James", chapter: 1, verse: 2, referenceCode: "JAS.1.2", theme: "joy" },
  { book: "Psalms", chapter: 30, verse: 5, referenceCode: "PSA.30.5", theme: "joy" },
  { book: "Galatians", chapter: 5, verse: 22, referenceCode: "GAL.5.22", theme: "joy" },
  { book: "Philippians", chapter: 4, verse: 4, referenceCode: "PHP.4.4", theme: "joy" },
  { book: "John", chapter: 15, verse: 11, referenceCode: "JHN.15.11", theme: "joy" },
  { book: "Psalms", chapter: 118, verse: 24, referenceCode: "PSA.118.24", theme: "joy" },
  { book: "Habakkuk", chapter: 3, verse: 18, referenceCode: "HAB.3.18", theme: "joy" },
];

// ─── Image Presets: starter backgrounds for verse sharing ───

const presets = [
  { name: "Mountain Sunrise", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", category: "nature", tags: ["mountains", "sunrise"] },
  { name: "Ocean Waves", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", category: "nature", tags: ["ocean", "beach"] },
  { name: "Forest Path", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800", category: "nature", tags: ["forest", "path"] },
  { name: "Starry Night", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800", category: "nature", tags: ["stars", "night"] },
  { name: "Golden Fields", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", category: "nature", tags: ["fields", "golden"] },
  { name: "Calm Lake", imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800", category: "nature", tags: ["lake", "calm"] },
  { name: "Desert Sunset", imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800", category: "nature", tags: ["desert", "sunset"] },
  { name: "Waterfall", imageUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800", category: "nature", tags: ["waterfall", "green"] },
  { name: "Autumn Leaves", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", category: "nature", tags: ["autumn", "leaves"] },
  { name: "Snow Peaks", imageUrl: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800", category: "nature", tags: ["snow", "mountains"] },
  { name: "Dark Minimal", imageUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800", category: "minimal", tags: ["dark", "gradient"] },
  { name: "Soft Light", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", category: "minimal", tags: ["light", "soft"] },
];

async function seed() {
  console.log("Seeding verse library...");
  await db.insert(verseLibrary).values(verses).onConflictDoNothing();
  console.log(`  ✓ ${verses.length} verses`);

  console.log("Seeding image presets...");
  await db.insert(imagePresets).values(presets).onConflictDoNothing();
  console.log(`  ✓ ${presets.length} presets`);

  console.log("Done!");
}

seed().catch(console.error);
