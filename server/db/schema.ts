import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ─── Better Auth tables (managed by Better Auth, defined here for FK references) ───

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Application tables ───

export const imagePresets = pgTable(
  "image_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().default([]),
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    uploadedBy: text("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_image_presets_category").on(table.category),
    index("idx_image_presets_active").on(table.isActive),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    version: text("version").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("favorites_user_verse_unique").on(
      table.userId,
      table.book,
      table.chapter,
      table.verse,
      table.version,
    ),
    index("idx_favorites_user_id").on(table.userId),
  ],
);

export const verseOfTheDay = pgTable(
  "verse_of_the_day",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    version: text("version").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("verse_of_the_day_date_version_unique").on(
      table.date,
      table.version,
    ),
    index("idx_verse_of_day_date").on(table.date),
  ],
);

export const sharedVerses = pgTable(
  "shared_verses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    verseText: text("verse_text").notNull(),
    reference: text("reference").notNull(),
    version: text("version").notNull(),
    imageUrl: text("image_url").notNull(),
    presetId: uuid("preset_id"),
    shareCount: integer("share_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_shared_verses_user").on(table.userId),
    index("idx_shared_verses_created").on(table.createdAt),
  ],
);

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  defaultVersion: text("default_version").default("WEB"),
  fontSize: integer("font_size").default(16),
  fontStyle: text("font_style").default("serif"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("reading_progress_user_book_chapter_unique").on(
      table.userId,
      table.book,
      table.chapter,
    ),
    index("idx_reading_progress_user").on(table.userId),
    index("idx_reading_progress_book").on(table.userId, table.book),
  ],
);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const pushTokens = pgTable(
  "push_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pushToken: text("push_token").notNull().unique(),
    platform: text("platform").notNull(), // 'ios' | 'android'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_push_tokens_user_id").on(table.userId)],
);

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  dailyVerseEnabled: boolean("daily_verse_enabled").default(true),
  dailyVerseTime: text("daily_verse_time").default("09:00"), // HH:MM format
  timezone: text("timezone").default("America/New_York"),
  readingStreakEnabled: boolean("reading_streak_enabled").default(true),
  chapterCompletionEnabled: boolean("chapter_completion_enabled").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const aiChatUsage = pgTable(
  "ai_chat_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    messageCount: integer("message_count").default(0),
    lastResetDate: date("last_reset_date").defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("ai_chat_usage_user_date_unique").on(
      table.userId,
      table.lastResetDate,
    ),
    index("idx_ai_chat_usage_user_date").on(table.userId, table.lastResetDate),
  ],
);

export const chapterAudio = pgTable(
  "chapter_audio",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookName: text("book_name").notNull(),
    chapter: integer("chapter").notNull(),
    version: text("version").notNull(),
    audioUrl: text("audio_url").notNull(),
    duration: integer("duration"),
    formatVersion: text("format_version").default("v1"),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("chapter_audio_book_chapter_version_unique").on(
      table.bookName,
      table.chapter,
      table.version,
    ),
    index("idx_chapter_audio_lookup").on(
      table.bookName,
      table.chapter,
      table.version,
      table.formatVersion,
    ),
  ],
);

export const verseLibrary = pgTable(
  "verse_library",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    referenceCode: text("reference_code").notNull(),
    theme: text("theme").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_verse_library_theme").on(table.theme)],
);
