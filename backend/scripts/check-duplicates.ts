import { supabase } from '../src/lib/supabase';

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate presets...\n');

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

  // Find duplicates
  const duplicates = Array.from(nameMap.entries())
    .filter(([_, presets]) => presets.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate preset names:\n`);
  
  duplicates.forEach(([name, presets]) => {
    console.log(`📷 "${name}" (${presets.length} copies):`);
    presets.forEach((p, i) => {
      console.log(`   ${i + 1}. ID: ${p.id}, Created: ${new Date(p.created_at).toLocaleString()}`);
      console.log(`      URL: ${p.image_url.substring(0, 80)}...`);
    });
    console.log('');
  });

  console.log('\n💡 To remove duplicates, run: npm run clean-duplicates');
}

checkDuplicates();
