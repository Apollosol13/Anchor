-- Add format_version column to chapter_audio table
-- This allows automatic cache invalidation when audio format changes

ALTER TABLE chapter_audio 
ADD COLUMN IF NOT EXISTS format_version TEXT DEFAULT 'v1';

-- Optional: Clear old cache entries without format_version
-- Uncomment the line below if you want to force regeneration of all old audio
-- DELETE FROM chapter_audio WHERE format_version IS NULL OR format_version = 'v1';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chapter_audio_lookup 
ON chapter_audio(book_name, chapter, version, format_version);
