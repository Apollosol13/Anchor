# Local Development Setup

This guide will help you set up the Anchor Bible app for local development.

## Prerequisites

Make sure you have installed:
- **Node.js** 18 or higher ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com))

## Step 1: Clone the Repository

```bash
git clone https://github.com/Apollosol13/Anchor.git
cd Anchor
```

## Step 2: Get API Keys

You'll need to create free accounts and get API keys for:

### 2.1 Supabase (Database & Storage)

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for it to initialize (~2 minutes)
4. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key

5. Create storage buckets:
   - Go to **Storage**
   - Create `preset-images` bucket (public)
   - Create `user-uploads` bucket (public)

### 2.2 Bible API

1. Go to [https://scripture.api.bible](https://scripture.api.bible)
2. Sign up for free account
3. Create an API key
4. Copy the key

### 2.3 OpenAI (Optional - for AI features)

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Go to **API Keys**
4. Create new secret key
5. Copy the key

> **Note**: OpenAI is optional for development. The app will still work without it, but AI explanations won't be available.

## Step 3: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env` and add your credentials:

```env
# Use local PostgreSQL or Supabase PostgreSQL URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/anchor"
# Or use Supabase:
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"

SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
BIBLE_API_KEY="your-bible-api-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:5173"
```

### 3.1 Set Up Database

If using local PostgreSQL:

```bash
# Install PostgreSQL if you haven't
# macOS: brew install postgresql
# Start PostgreSQL service

# Create database
createdb anchor
```

If using Supabase (recommended for easier setup):
- Just use the DATABASE_URL from Supabase dashboard
- It includes everything you need!

### 3.2 Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
npx prisma studio
```

### 3.3 Start Backend Server

```bash
npm run dev
```

Backend should now be running on `http://localhost:3001`

Test it:
```bash
curl http://localhost:3001/health
```

## Step 4: Set Up Frontend

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
VITE_API_URL="http://localhost:3001"
```

### 4.1 Start Frontend Development Server

```bash
npm run dev
```

Frontend should now be running on `http://localhost:5173`

## Step 5: Add Sample Data (Optional)

### 5.1 Add Image Presets

You can add sample image presets to your database:

1. Find some free images from [Unsplash](https://unsplash.com) or [Pexels](https://pexels.com)
2. Upload them to Supabase Storage in the `preset-images` bucket
3. Use Prisma Studio to add records:

```bash
# Open Prisma Studio
npx prisma studio
```

Or use SQL in Supabase:

```sql
INSERT INTO "ImagePreset" (id, name, "imageUrl", category, tags, "isActive", "createdAt")
VALUES (
  gen_random_uuid(),
  'Beautiful Mountain',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  'nature',
  ARRAY['mountains', 'peaceful'],
  true,
  NOW()
);
```

## Step 6: Test the App

1. Open `http://localhost:5173` in your browser
2. You should see the Verse of the Day
3. Try these features:
   - Change background image
   - Click "Explain with AI" (if OpenAI key is set)
   - Navigate to "Browse" and search for verses
   - Download a verse image

## Common Issues

### Backend won't start

**Error: `P1001: Can't reach database server`**
- Check that PostgreSQL is running
- Verify DATABASE_URL is correct
- If using Supabase, check internet connection

**Error: `BIBLE_API_KEY not set`**
- Add your Bible API key to `.env`
- Restart the backend server

### Frontend shows errors

**Error: `Network Error`**
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`

**No images showing**
- Make sure you've created Supabase storage buckets
- Check that buckets are set to public
- Add some image presets to the database

### AI Explanations not working

- Verify OPENAI_API_KEY is valid
- Check that you have credits in OpenAI account
- View browser console for errors

## Development Workflow

### Making Changes to Backend

```bash
cd backend

# Watch mode - auto-restarts on changes
npm run dev

# If you change Prisma schema:
npx prisma generate
npx prisma migrate dev
```

### Making Changes to Frontend

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production (test)
npm run build
npm run preview
```

### Git Workflow

```bash
# Create a new feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature
```

## Project Structure

```
Anchor/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Express server
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities
│   │   └── App.tsx       # Main app
│   └── package.json
│
├── README.md
├── DEPLOYMENT.md          # Production deployment guide
└── SETUP.md              # This file
```

## Next Steps

- Read the [README.md](README.md) for project overview
- Check [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy
- Explore the codebase and make it your own!
- Add more features:
  - User authentication
  - Favorites persistence
  - Social sharing improvements
  - More Bible versions
  - Custom fonts and themes

## Getting Help

If you run into issues:

1. Check the console/terminal for error messages
2. Review this setup guide
3. Check that all environment variables are set correctly
4. Make sure all services (PostgreSQL, backend, frontend) are running

Happy coding! 🚀⚓️
