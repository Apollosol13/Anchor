-- Anchor Bible App - Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all necessary tables

-- Image Presets Table
CREATE TABLE IF NOT EXISTS image_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_presets_category ON image_presets(category);
CREATE INDEX IF NOT EXISTS idx_image_presets_active ON image_presets(is_active);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  version TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book, chapter, verse, version)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Verse of the Day Table
CREATE TABLE IF NOT EXISTS verse_of_the_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  version TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verse_of_day_date ON verse_of_the_day(date);

-- Shared Verses Table (Optional - for tracking shared verses)
CREATE TABLE IF NOT EXISTS shared_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  version TEXT NOT NULL,
  image_url TEXT NOT NULL,
  preset_id UUID,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_verses_user ON shared_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_verses_created ON shared_verses(created_at);

-- User Preferences Table (Optional - for user settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  default_version TEXT DEFAULT 'ESV',
  font_size INTEGER DEFAULT 16,
  font_style TEXT DEFAULT 'serif',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Progress Table - Track which chapters users have completed
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book, chapter)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book ON reading_progress(user_id, book);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE image_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow service role full access, configure user access as needed)
CREATE POLICY "Service role can do everything on image_presets" ON image_presets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on favorites" ON favorites
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on verse_of_the_day" ON verse_of_the_day
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on shared_verses" ON shared_verses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_preferences" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on reading_progress" ON reading_progress
  FOR ALL USING (true) WITH CHECK (true);
