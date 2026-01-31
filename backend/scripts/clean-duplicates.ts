import { supabase } from '../src/lib/supabase';
import * as readline from 'readline';

async function cleanDuplicates() {
  console.log('🧹 Checking for duplicate presets...\n');

  const { data, error } = await supabase
    .from('image_presets')
    .select('id, name, image_url, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log(`📊 Total presets in database: ${data.length}\n`);

  // Group by name to find duplicates
  const nameMap = new Map<string, any[]>();
  data.forEach((preset) => {
    if (!nameMap.has(preset.name)) {
      nameMap.set(preset.name, []);
    }
    nameMap.get(preset.name)!.push(preset);
  });

  // Find duplicates (keep the oldest, remove newer ones)
  const duplicates = Array.from(nameMap.entries())
    .filter(([_, presets]) => presets.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate preset names:\n`);
  
  let totalToDelete = 0;
  const idsToDelete: number[] = [];

  duplicates.forEach(([name, presets]) => {
    console.log(`📷 "${name}" (${presets.length} copies):`);
    // Keep the first (oldest) one, delete the rest
    presets.forEach((p, i) => {
      if (i === 0) {
        console.log(`   ✅ KEEP: ID ${p.id} (oldest, ${new Date(p.created_at).toLocaleString()})`);
      } else {
        console.log(`   ❌ DELETE: ID ${p.id} (${new Date(p.created_at).toLocaleString()})`);
        idsToDelete.push(p.id);
        totalToDelete++;
      }
    });
    console.log('');
  });

  console.log(`\n📝 Summary:`);
  console.log(`   Total duplicates to delete: ${totalToDelete}`);
  console.log(`   Will keep: ${duplicates.length} (oldest of each)`);

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n⚠️  Delete these duplicates? (yes/no): ', async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled. No changes made.');
      process.exit(0);
    }

    console.log('\n🗑️  Deleting duplicates...\n');

    for (const id of idsToDelete) {
      const { error: deleteError } = await supabase
        .from('image_presets')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error(`❌ Failed to delete ID ${id}:`, deleteError.message);
      } else {
        console.log(`✅ Deleted ID ${id}`);
      }
    }

    console.log(`\n✨ Done! Deleted ${idsToDelete.length} duplicate presets.`);
  });
}

cleanDuplicates();
