-- Make the preset-images bucket publicly accessible
-- Run this in Supabase SQL Editor

-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'preset-images';

-- Add RLS policy to allow public reads
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'preset-images');
