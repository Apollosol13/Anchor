import { supabase } from '../src/lib/supabase';
import * as readline from 'readline';

const SUPABASE_BUCKET = 'preset-images';

async function deleteAllPresets() {
  console.log('🗑️  Fetching all presets...\n');

  // Get all presets from database
  const { data: presets, error: fetchError } = await supabase
    .from('image_presets')
    .select('id, name, image_url');

  if (fetchError) {
    console.error('❌ Error fetching presets:', fetchError);
    process.exit(1);
  }

  if (!presets || presets.length === 0) {
    console.log('✅ No presets found. Database is already empty.');
    return;
  }

  console.log(`📊 Found ${presets.length} presets in database\n`);

  // List all files in storage bucket
  const { data: files, error: listError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .list();

  if (listError) {
    console.error('❌ Error listing storage files:', listError);
  } else {
    console.log(`📦 Found ${files?.length || 0} files in storage bucket\n`);
  }

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`⚠️  WARNING: This will delete ALL ${presets.length} presets and their images. Continue? (yes/no): `, async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled. No changes made.');
      process.exit(0);
    }

    console.log('\n🗑️  Deleting all presets...\n');

    // Delete from database
    console.log('1️⃣  Deleting database records...');
    
    // Delete all records by ID
    let deletedCount = 0;
    for (const preset of presets) {
      const { error } = await supabase
        .from('image_presets')
        .delete()
        .eq('id', preset.id);
      
      if (error) {
        console.error(`❌ Failed to delete ID ${preset.id}:`, error.message);
      } else {
        deletedCount++;
      }
    }
    
    console.log(`✅ Deleted ${deletedCount} records from database`);

    // Delete from storage
    if (files && files.length > 0) {
      console.log('\n2️⃣  Deleting storage files...');
      const filePaths = files.map(f => f.name);
      
      const { error: deleteStorageError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove(filePaths);

      if (deleteStorageError) {
        console.error('❌ Failed to delete from storage:', deleteStorageError);
      } else {
        console.log(`✅ Deleted ${filePaths.length} files from storage`);
      }
    }

    console.log('\n✨ Done! All presets have been removed.');
    console.log('💡 You can now upload fresh presets with: railway run npm run upload-presets');
  });
}

deleteAllPresets();
