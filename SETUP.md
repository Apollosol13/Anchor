# Local Development Setup

## Prerequisites

- [Bun](https://bun.sh) (runtime + package manager + test runner)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`bun install -g expo-cli` or use `bunx expo`)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`bun install -g eas-cli`) — for builds + deploys
- iOS Simulator (Xcode) and/or Android Emulator (Android Studio)

## Step 1: Install Dependencies

```bash
git clone https://github.com/Apollosol13/Anchor.git
cd Anchor
bun install
```

## Step 2: Get API Keys

You'll need accounts with these services:

| Service           | What for                                   | Get it at                                          |
| ----------------- | ------------------------------------------ | -------------------------------------------------- |
| **Neon**          | Postgres database                          | [neon.tech](https://neon.tech)                     |
| **API.Bible**     | Scripture data                             | [scripture.api.bible](https://scripture.api.bible) |
| **OpenAI**        | AI features + TTS audio                    | [platform.openai.com](https://platform.openai.com) |
| **Upstash**       | Redis (rate limiting) + QStash (workflows) | [upstash.com](https://upstash.com)                 |
| **Cloudflare R2** | File storage (images, audio)               | [dash.cloudflare.com](https://dash.cloudflare.com) |

All have free tiers sufficient for development.

## Step 3: Configure Environment

```bash
cp .env.development.local.example .env.development.local
```

Fill in your secrets in `.env.development.local`:

```env
# Database — get from Neon dashboard → Connection Details
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# Auth — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-generated-secret

# APIs
OPENAI_API_KEY=sk-...
BIBLE_API_KEY=your-bible-api-key

# Cloudflare R2 — get from Cloudflare dashboard → R2 → Manage R2 API Tokens
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=anchor-dev
R2_PUBLIC_URL=https://pub-xxx.r2.dev   # or custom domain

# Upstash Redis — get from Upstash console → Redis → REST API
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Upstash QStash — for local dev, start with `bun run qstash:local`
# These are the local dev server defaults:
QSTASH_TOKEN=eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=
QSTASH_CURRENT_SIGNING_KEY=sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r
QSTASH_NEXT_SIGNING_KEY=sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs
```

The non-secret URLs (like `BETTER_AUTH_URL=http://localhost:8081`) are already in the committed `.env.development` file.

## Step 4: Set Up Database

```bash
# Generate Drizzle migration files from schema
bun run db:generate

# Apply migrations to your Neon database
bun run db:migrate
```

To inspect your database:

```bash
bun run db:studio
```

This opens [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) in your browser.

### Seed Data

If you have a `verse_library` export from the old Supabase database:

```bash
# Import verse library data (needed for verse of the day)
psql $DATABASE_URL < verse_library_dump.sql
```

## Step 5: Start Development

```bash
# Start Expo dev server
bun start
```

Then press:

- `i` — open iOS simulator
- `a` — open Android emulator
- `w` — open web browser

### Running the QStash local dev server

For testing scheduled notification workflows locally:

```bash
# In a separate terminal
bun run qstash:local
```

This starts a local QStash server at `http://127.0.0.1:8080` that your workflow can send to during development.

## Step 6: Verify Everything Works

1. **Web**: open `http://localhost:8081` — you should see the landing page
2. **API**: `curl http://localhost:8081/api/health` — should return `{"status":"healthy"}`
3. **Native**: the app should show the sign-in screen, then the daily verse after auth
4. **Database**: `bun run db:studio` — tables should be visible and queryable

## Scripts Reference

| Script                 | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `bun start`            | Start Expo dev server                             |
| `bun run web`          | Start web only                                    |
| `bun run ios`          | Build + run on iOS simulator                      |
| `bun run android`      | Build + run on Android emulator                   |
| `bun run db:generate`  | Generate Drizzle migrations from schema           |
| `bun run db:migrate`   | Apply migrations to database                      |
| `bun run db:studio`    | Open Drizzle Studio (browser-based DB viewer)     |
| `bun run db:seed`      | Seed database with sample data                    |
| `bun run qstash:local` | Start local QStash dev server                     |
| `bun run fmt`          | Format code with oxfmt                            |
| `bun run fmt:check`    | Check formatting (CI)                             |
| `bun run lnt`          | Lint + auto-fix with oxlint                       |
| `bun run lnt:check`    | Check lint (CI)                                   |
| `bun run typecheck`    | TypeScript type check                             |
| `bun test`             | Run tests                                         |
| `bun test --watch`     | Run tests in watch mode                           |
| `bun run sanity`       | Run all checks (typecheck + lint + format + test) |

## Common Issues

### "Cannot find module" errors

Make sure you ran `bun install`. If path aliases aren't resolving, check that `tsconfig.json` has:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### Database connection errors

- Verify `DATABASE_URL` in `.env.development.local` is correct
- Make sure you're using the Neon connection string with `?sslmode=require`
- Check that your IP isn't blocked in Neon's dashboard

### API routes returning 500

- Check terminal output for the actual error
- Verify all env vars are set (missing `BIBLE_API_KEY` or `OPENAI_API_KEY` will cause failures)
- Run `bun run typecheck` to catch type errors

### Push notifications not working in simulator

Push notifications require a physical device. The simulator will skip token registration silently. To test:

1. Build a dev client: `bun run build:ios:preview`
2. Install on physical device
3. Notifications will register on app launch

## Project Structure

```
Anchor/
├── app/                     # Expo Router (pages + API routes)
│   ├── (marketing)/         # Web: landing, privacy, terms
│   ├── (tabs)/              # Native: home, bible, anchor, bookmarks, settings
│   ├── api/                 # Server-side API routes (Expo API Routes)
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── server/
│   ├── db/                  # Drizzle schema + Neon connection
│   │   ├── index.ts         # db instance (Neon HTTP + Drizzle)
│   │   └── schema.ts        # All table definitions
│   └── services/            # Business logic
│       ├── bibleService.ts
│       ├── imageService.ts
│       ├── notificationService.ts  # Push + Upstash Workflow
│       └── openaiService.ts
├── lib/                     # Shared utilities
│   ├── api.ts               # Client-side API wrapper
│   ├── api-helpers.ts       # Server-side (json, error, auth, rate limit)
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client (Expo)
│   ├── rate-limit.ts        # Upstash Redis rate limiter
│   └── storage.ts           # Cloudflare R2 client
├── components/              # React Native components
├── public/.well-known/      # iOS Universal Links + Android App Links
├── .env                     # Shared defaults (committed)
├── .env.development         # Dev URLs (committed)
├── .env.development.local   # Dev secrets (gitignored)
├── drizzle.config.ts        # Drizzle Kit config
├── app.json                 # Expo config
└── package.json
```
