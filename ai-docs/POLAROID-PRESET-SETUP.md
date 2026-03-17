# Polaroid Frame Template Setup Guide

## ✅ What's Been Done:

1. **Created a Polaroid frame template** - Vintage Polaroid instant photo frame
2. **Downloaded Caveat handwritten font** - Beautiful handwritten Google Font
3. **Added font loading** to the app via expo-font
4. **Modified ShareModal** with interactive frame template support:
   - When user selects "Polaroid", they're prompted to choose their own photo
   - User's photo appears **inside** the Polaroid frame
   - Polaroid frame overlays on top
   - Text appears in handwritten style (Caveat font) in the white bottom area
   - Text can be dragged to perfect position

## 📝 How It Works:

### User Flow:

1. User taps **"Share"** on a verse
2. Selects **"Background Presets"**
3. Chooses **"Polaroid"**
4. App immediately opens camera roll
5. User selects their own photo (family, nature, selfie, etc.)
6. Photo appears **inside** the Polaroid frame
7. Verse text appears in **handwritten style** on the white bottom area
8. User can drag text to perfect position
9. Share or save the final image! 📸✍️

## 📝 What You Need to Do in Supabase:

### Step 1: Upload Polaroid Frame to Storage

1. Go to **Supabase Dashboard** > **Storage**
2. Navigate to your `preset-images` bucket (create if it doesn't exist, make it **PUBLIC**)
3. Upload the file: `/Users/brennenstudenc/Desktop/Anchor/frontend-new/assets/images/polaroid-bg.png`
4. Click the three dots (•••) next to the uploaded file
5. Select **Copy URL**
6. Save that URL for the next step

### Step 2: Add Database Columns (if needed)

Run this in **Supabase Dashboard** > **SQL Editor**:

```sql
-- Add new columns for frame template support
ALTER TABLE image_presets
ADD COLUMN IF NOT EXISTS text_color TEXT,
ADD COLUMN IF NOT EXISTS font_family TEXT,
ADD COLUMN IF NOT EXISTS is_frame_template BOOLEAN DEFAULT FALSE;
```

### Step 3: Insert the Polaroid Preset

```sql
INSERT INTO image_presets (
  name,
  image_url,
  category,
  tags,
  text_color,
  font_family,
  is_frame_template,
  sort_order,
  is_active
)
VALUES (
  'Polaroid',
  'YOUR_SUPABASE_PUBLIC_URL_HERE',  -- Replace with URL from Step 1
  'vintage',
  ARRAY['polaroid', 'retro', 'handwritten', 'frame'],
  '#2c3e50',      -- Dark gray/blue text (perfect for white Polaroid bottom)
  'Caveat',       -- Handwritten font
  true,           -- THIS IS A FRAME TEMPLATE!
  0,
  true
);
```

## 🎯 The Magic:

- **`is_frame_template: true`** tells the app this is a special interactive frame
- When selected, app prompts user to add their own photo
- User's photo = background layer
- Polaroid frame = overlay layer
- Text = bottom white area with handwritten styling

## 🎨 Result:

Beautiful personalized verse images that look like handwritten Polaroid photos with the user's own memories inside! 📸✍️💙
