# Anchor ⚓️

A beautiful Bible app for sharing verses with stunning imagery, multiple Bible versions, and AI-powered explanations.

## Features

- 📖 **Verse of the Day** - Daily inspiration with shareable images
- 🎨 **Image Presets** - Curated beautiful backgrounds for verses
- 🖼️ **Custom Images** - Upload your own photos
- 📚 **Multiple Bible Versions** - ESV, NIV, KJV, and more
- 🤖 **AI Explanations** - Deep dive into scripture with OpenAI
- ❤️ **Favorites** - Save and organize your favorite verses
- 🔗 **Share** - Beautiful verse cards for social media

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS
- React Query (data fetching)
- Supabase (auth & storage)

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Supabase (database & auth)

### External APIs
- Bible API (scripture data)
- OpenAI API (verse explanations)
- Supabase Storage (image hosting)

## Project Structure

```
anchor/
├── frontend/          # React application
├── backend/           # Express API server
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- API Keys:
  - Bible API key
  - OpenAI API key
  - Supabase credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Apollosol13/Anchor.git
cd Anchor
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

3. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

4. Visit `http://localhost:5173` in your browser

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
BIBLE_API_KEY="your-bible-api-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
```

### Frontend (.env)
```env
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_API_URL="http://localhost:3001"
```

## Development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Bible API for scripture data
- OpenAI for AI-powered explanations
- Supabase for backend infrastructure
