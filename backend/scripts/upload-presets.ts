import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '../src/lib/supabase';

/**
 * Script to upload preset images from a local folder to Supabase
 * 
 * Usage:
 * 1. Update the PRESETS_FOLDER_PATH below to point to your "Bible Prompts" folder
 * 2. Run: npx ts-node scripts/upload-presets.ts
 */

const PRESETS_FOLDER_PATH = '/Users/brennenstudenc/Desktop/Bible Prompts 2';
const SUPABASE_BUCKET = 'preset-images';

async function uploadPresets() {
  console.log('🚀 Starting preset upload...\n');
  console.log(`📂 Checking folder: ${PRESETS_FOLDER_PATH}`);

  // Check if folder exists
  if (!fs.existsSync(PRESETS_FOLDER_PATH)) {
    console.error(`❌ Error: Folder not found at ${PRESETS_FOLDER_PATH}`);
    console.log('Please update PRESETS_FOLDER_PATH in the script to point to your "Bible Prompts" folder');
    process.exit(1);
  }
  
  console.log('✅ Folder found!');

  // Get all image files
  console.log('🔍 Reading files...');
  const files = fs.readdirSync(PRESETS_FOLDER_PATH);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Found ${imageFiles.length} images in folder\n`);

  if (imageFiles.length === 0) {
    console.log('No image files found. Exiting.');
    process.exit(0);
  }

  // Get existing images from database to avoid duplicates
  console.log('🔗 Connecting to Supabase...');
  const { data: existingPresets } = await supabase
    .from('image_presets')
    .select('name');
  
  console.log('✅ Connected to Supabase!');
  
  const existingNames = new Set(existingPresets?.map((p: any) => p.name) || []);
  console.log(`📊 Found ${existingNames.size} existing presets in database\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const filePath = path.join(PRESETS_FOLDER_PATH, file);
    const originalName = path.parse(file).name; // Get filename without extension
    
    try {
      // Check if already uploaded
      if (existingNames.has(originalName)) {
        console.log(`[${i + 1}/${imageFiles.length}] ⏭️  Skipping ${file} (already uploaded)`);
        skippedCount++;
        continue;
      }

      console.log(`[${i + 1}/${imageFiles.length}] Uploading ${file}...`);

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Use original filename with timestamp to ensure uniqueness in storage
      const ext = path.extname(file);
      const fileName = `${originalName}-${Date.now()}${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: `image/${ext.replace('.', '')}`,
          upsert: false,
        });

      if (uploadError) {
        console.error(`  ❌ Upload failed: ${uploadError.message}`);
        errorCount++;
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(fileName);

      // Insert into database with original filename as name
      const { error: dbError } = await supabase
        .from('image_presets')
        .insert([{
          name: originalName, // Use original filename to track duplicates
          image_url: urlData.publicUrl,
          category: 'preset',
          is_active: true,
          sort_order: i,
        }]);

      if (dbError) {
        console.error(`  ❌ Database insert failed: ${dbError.message}`);
        errorCount++;
        continue;
      }

      console.log(`  ✅ Success! (${urlData.publicUrl.substring(0, 50)}...)`);
      successCount++;

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Upload complete!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));
}

// Create storage bucket if it doesn't exist
async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === SUPABASE_BUCKET);

    if (!bucketExists) {
      console.log(`📦 Creating storage bucket: ${SUPABASE_BUCKET}`);
      const { error } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
        public: true,
      });
      
      if (error) {
        console.error('❌ Failed to create bucket:', error.message);
        process.exit(1);
      }
      console.log('✅ Bucket created successfully\n');
    }
  } catch (error) {
    console.error('❌ Error checking bucket:', error);
    process.exit(1);
  }
}

// Run the script
(async () => {
  await ensureBucketExists();
  await uploadPresets();
})();
