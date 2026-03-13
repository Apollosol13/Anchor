# Deployment Guide for Anchor Bible App

This guide will walk you through deploying your Anchor Bible app to production using Railway for the backend and your choice of hosting for the frontend.

## Prerequisites

Before deploying, you'll need accounts and API keys for:

1. **Supabase** - Database, Authentication, and Storage
2. **Railway** - Backend hosting
3. **Bible API** - Scripture data (https://scripture.api.bible)
4. **OpenAI** - AI explanations (https://platform.openai.com)
5. **Vercel/Netlify** (optional) - Frontend hosting

---

## Part 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: Anchor
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Wait for project to initialize (~2 minutes)

### 1.2 Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query" and run this to set up Row Level Security:

```sql
-- Enable RLS on all tables (will be created by Prisma)
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ImagePreset" ENABLE ROW LEVEL SECURITY;
```

### 1.3 Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create two buckets:
   - **preset-images** (Public bucket)
     - Used for your curated background images
   - **user-uploads** (Public bucket)
     - Used for user-uploaded custom backgrounds

3. Set storage policies:

**For preset-images:**
```sql
-- Allow public read
CREATE POLICY "Public can view preset images"
ON storage.objects FOR SELECT
USING (bucket_id = 'preset-images');

-- Allow authenticated uploads (you'll add admin check later)
CREATE POLICY "Authenticated can upload presets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'preset-images' AND auth.role() = 'authenticated');
```

**For user-uploads:**
```sql
-- Allow public read
CREATE POLICY "Public can view user uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Allow users to upload their own
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 1.4 Get Supabase Credentials

1. Go to **Settings** > **API**
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## Part 2: Get External API Keys

### 2.1 Bible API Key

1. Go to [https://scripture.api.bible](https://scripture.api.bible)
2. Sign up for a free account
3. Create a new API key
4. Copy the key

### 2.2 OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Go to **API Keys**
4. Create a new secret key
5. Copy the key (you won't see it again!)

---

## Part 3: Deploy Backend to Railway

### 3.1 Set Up Railway Project

1. Go to [https://railway.app](https://railway.app) and sign up/login with GitHub
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Connect your GitHub account
5. Select the **Apollosol13/Anchor** repository
6. Railway will detect it's a monorepo

### 3.2 Configure Backend Service

1. After creating project, click **New Service** > **GitHub Repo**
2. Name it "anchor-backend"
3. Click on the service and go to **Settings**
4. Set **Root Directory** to: `backend`
5. Set **Build Command** to: `npm install && npx prisma generate && npm run build`
6. Set **Start Command** to: `npm run prisma:migrate && npm start`

### 3.3 Add PostgreSQL Database

1. In your Railway project, click **New** > **Database** > **PostgreSQL**
2. Railway will automatically create a database
3. It will add a `DATABASE_URL` environment variable to your backend service

### 3.4 Set Environment Variables

1. Click on your backend service
2. Go to **Variables** tab
3. Add these variables:

```
DATABASE_URL = (automatically added by Railway)
SUPABASE_URL = your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
BIBLE_API_KEY = your-bible-api-key
OPENAI_API_KEY = your-openai-api-key
PORT = 3001
NODE_ENV = production
ALLOWED_ORIGINS = https://your-frontend-domain.com
```

4. Click **Deploy** (top right)

### 3.5 Get Backend URL

1. Once deployed, go to **Settings** tab
2. Under **Networking**, click **Generate Domain**
3. Copy the URL (something like: `https://anchor-backend-production.up.railway.app`)

---

## Part 4: Deploy Frontend

### Option A: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
```
VITE_SUPABASE_URL = your-supabase-url
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
VITE_API_URL = your-railway-backend-url
```

6. Click **Deploy**

### Option B: Deploy to Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Click **Add new site** > **Import existing project**
3. Connect to GitHub and select your repo
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add Environment Variables (same as Vercel above)
6. Click **Deploy**

---

## Part 5: Update CORS Settings

After frontend is deployed:

1. Go back to Railway
2. Update the `ALLOWED_ORIGINS` variable:
```
ALLOWED_ORIGINS = https://your-vercel-app.vercel.app,http://localhost:5173
```

3. Redeploy the backend

---

## Part 6: Add Initial Image Presets

You'll want to add some beautiful preset images:

### 6.1 Find Images

Use free image sources:
- [Unsplash](https://unsplash.com) - Search: "nature", "sunset", "mountains"
- [Pexels](https://pexels.com) - Beautiful free photos
- Make sure images are landscape orientation (16:9 or 4:3)

### 6.2 Upload to Supabase

1. Download 10-20 beautiful images
2. Go to Supabase **Storage** > **preset-images**
3. Upload images
4. Copy the public URL for each

### 6.3 Add to Database

Use the Supabase SQL Editor:

```sql
INSERT INTO "ImagePreset" (id, name, "imageUrl", category, tags, "isActive", "sortOrder", "createdAt")
VALUES 
  (gen_random_uuid(), 'Beautiful Sunset', 'https://your-supabase.co/storage/v1/object/public/preset-images/sunset1.jpg', 'sunset', ARRAY['peaceful', 'warm'], true, 1, NOW()),
  (gen_random_uuid(), 'Mountain Peaks', 'https://your-supabase.co/storage/v1/object/public/preset-images/mountain1.jpg', 'mountains', ARRAY['inspiring', 'nature'], true, 2, NOW()),
  (gen_random_uuid(), 'Ocean Waves', 'https://your-supabase.co/storage/v1/object/public/preset-images/ocean1.jpg', 'ocean', ARRAY['peaceful', 'blue'], true, 3, NOW());
-- Add more...
```

---

## Part 7: Testing

### Test Backend

```bash
curl https://your-railway-backend.railway.app/health
```

Should return: `{"status":"healthy","timestamp":"..."}`

### Test Verse API

```bash
curl https://your-railway-backend.railway.app/api/verses/verse-of-day
```

### Test Frontend

1. Visit your deployed frontend URL
2. Check that verse of the day loads
3. Try changing the background image
4. Test the AI explanation feature
5. Search for verses

---

## Part 8: Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to your project **Settings** > **Domains**
2. Add your custom domain (e.g., `anchor.yoursite.com`)
3. Follow DNS configuration instructions

### For Backend (Railway)

1. Go to backend service **Settings** > **Networking**
2. Add custom domain
3. Update `ALLOWED_ORIGINS` in environment variables

---

## Monitoring & Maintenance

### Railway Dashboard

- Monitor backend logs and metrics
- Check database usage
- View error logs

### Supabase Dashboard

- Monitor storage usage
- Check API usage
- View database queries

### Cost Estimates

- **Railway**: ~$5-10/month (includes database)
- **Supabase**: Free tier should handle thousands of users
- **Vercel/Netlify**: Free tier sufficient for most use
- **OpenAI**: ~$0.002 per explanation (pay as you go)
- **Bible API**: Free tier

---

## Troubleshooting

### Backend won't start

- Check Railway logs
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

### Images not loading

- Check Supabase storage bucket is public
- Verify CORS settings in Supabase
- Check image URLs are correct

### AI explanations failing

- Verify OPENAI_API_KEY is valid
- Check OpenAI account has credits
- View backend error logs

### Database connection issues

- Check DATABASE_URL format
- Verify Prisma migrations ran
- Check Railway PostgreSQL is running

---

## Next Steps

1. **Add Authentication**: Implement Supabase Auth for user accounts
2. **Add Admin Panel**: Create interface to manage image presets
3. **Analytics**: Add Google Analytics or Plausible
4. **SEO**: Add meta tags and sitemap
5. **PWA**: Make it installable as a Progressive Web App

---

## Support

For issues:
- Check Railway logs
- Review Supabase logs
- Check browser console for frontend errors

Happy deploying! 🚀⚓️
