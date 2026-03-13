import { db } from "@/server/db";
import { imagePresets } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function getPresets(category?: string) {
  let query = db
    .select()
    .from(imagePresets)
    .where(eq(imagePresets.isActive, true))
    .orderBy(imagePresets.sortOrder);

  if (category && category !== "all") {
    return db
      .select()
      .from(imagePresets)
      .where(
        and(
          eq(imagePresets.isActive, true),
          eq(imagePresets.category, category),
        ),
      )
      .orderBy(imagePresets.sortOrder);
  }

  return query;
}

export async function getRandomPreset() {
  const presets = await db
    .select()
    .from(imagePresets)
    .where(eq(imagePresets.isActive, true));

  if (presets.length === 0) return null;
  return presets[Math.floor(Math.random() * presets.length)];
}

export async function createPreset(data: {
  name: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  sortOrder?: number;
}) {
  const [preset] = await db
    .insert(imagePresets)
    .values({
      name: data.name,
      imageUrl: data.imageUrl,
      category: data.category,
      tags: data.tags || [],
      sortOrder: data.sortOrder || 0,
      isActive: true,
    })
    .returning();

  return preset;
}

export async function deletePreset(id: string) {
  await db.delete(imagePresets).where(eq(imagePresets.id, id));
}
