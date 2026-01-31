-- Create storage bucket for chapter audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-audio', 'chapter-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies to allow public access
CREATE POLICY "Public Access for Audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'chapter-audio');

CREATE POLICY "Service role can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chapter-audio');

CREATE POLICY "Service role can delete audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'chapter-audio');
