# Migration Status: Supabase → Neon + Better Auth + Expo API Routes

## Overview

Anchor was originally split across 3 projects:

| Project | Stack | Hosted on | Status |
|---|---|---|---|
| `backend/` | Express + Supabase + node-cron | Railway | **Archived** → `_archive/backend/` |
| `frontend/` | Expo + Supabase JS + Axios | EAS | **Merged into root** |
| `anchrapp-web/` | Static HTML | Netlify | **Archived** → `_archive/anchrapp-web/` |

It's now a **single Expo Router project** at root with:

- **Neon Postgres** + **Drizzle ORM** (replaces Supabase DB)
- **Better Auth** (replaces Supabase Auth)
- **Expo API Routes** (replaces Express)
- **Upstash Workflow** (replaces node-cron)
- **Upstash Redis** (rate limiting)
- **Cloudflare R2** (replaces Supabase Storage)
- **Expo Notifications** (push notifications client)
- **expo-server-sdk** (push notifications server)

---

## Current Project Structure

```
Anchor/
├── app/                          # Expo Router pages + API routes
│   ├── (marketing)/              # Web-only: landing, privacy, terms
│   ├── (tabs)/                   # Native app tabs: home, bible, anchor, bookmarks, settings
│   ├── api/
│   │   ├── ai/                   # explain, related, study-questions
│   │   ├── audio/                # generate-chapter-audio
│   │   ├── auth/                 # [...all] Better Auth catch-all
│   │   ├── favorites/            # CRUD
│   │   ├── health+api.ts
│   │   ├── images/               # presets, random, delete
│   │   ├── notifications/        # register-token, preferences, test
│   │   ├── uploads/              # presigned URL for client uploads
│   │   ├── verses/               # verse-of-day, search, chapter, reference, versions
│   │   └── workflows/            # notifications (Upstash Workflow)
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── server/
│   ├── db/                       # Drizzle schema + Neon connection
│   │   ├── index.ts
│   │   └── schema.ts
│   └── services/                 # Business logic
│       ├── bibleService.ts
│       ├── imageService.ts
│       ├── notificationService.ts
│       └── openaiService.ts
├── lib/                          # Shared utilities
│   ├── api.ts                    # Client-side fetch wrapper
│   ├── api-helpers.ts            # Server-side helpers (json, error, auth, rate limit)
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client (Expo)
│   ├── rate-limit.ts             # Upstash Redis rate limiter
│   └── storage.ts                # Cloudflare R2 client
├── components/                   # React Native components
├── public/.well-known/           # iOS Universal Links + Android App Links
├── _archive/                     # Old projects (reference only)
│   ├── backend/
│   └── anchrapp-web/
├── .env                          # Shared defaults (committed)
├── .env.development              # Dev URLs (committed)
├── .env.development.local        # Dev secrets (gitignored)
├── .env.production               # Prod URLs (committed)
├── .env.production.local         # Prod secrets (gitignored)
├── drizzle.config.ts
├── app.json
├── tsconfig.json
└── package.json
```

---

## What's Done

### Database (Neon + Drizzle)
- [x] `server/db/schema.ts` — all 15 tables defined (4 Better Auth + 11 app)
- [x] `server/db/index.ts` — Neon HTTP connection
- [x] `drizzle.config.ts` — Drizzle Kit config
- [x] `verse_of_the_day` unique constraint fixed: `(date, version)` not just `(date)`
- [x] `get_themed_verse` SQL RPC replaced with Drizzle query + hash-based offset
- [x] `increment_ai_chat_usage` / `get_ai_chat_usage` RPCs replaced with `onConflictDoUpdate`

### Auth (Better Auth)
- [x] `lib/auth.ts` — server config with Drizzle adapter + Expo plugin
- [x] `lib/auth-client.ts` — client with `expoClient`, SecureStore on native, localStorage on web
- [x] `app/api/auth/[...all]+api.ts` — catch-all handler
- [x] `app/sign-in.tsx` / `app/sign-up.tsx` — auth screens
- [x] `app/_layout.tsx` — protected route logic with session gating

### API Routes (all backend endpoints ported)
- [x] Verses: verse-of-day, chapter, search, reference, versions
- [x] AI: explain, related, study-questions (with per-user daily rate limits)
- [x] Images: presets (list, create, delete), random
- [x] Favorites: list, add, remove (auth-protected, user-scoped)
- [x] Audio: generate-chapter-audio (OpenAI TTS, DB caching)
- [x] Notifications: register-token, preferences (auto-creates defaults), test
- [x] Health check
- [x] Presigned upload route (R2)

### Notifications
- [x] `server/services/notificationService.ts` — consolidated service with:
  - `sendToUser()` — core push via expo-server-sdk
  - `sendTestNotification()` — test wrapper
  - `findDailyVerseRecipients()` — DB query + timezone matching
  - `findStreakReminderRecipients()` — DB query + 20:00 matching
  - `notificationWorkflow` — Upstash Workflow with durable parallel steps
  - Stale token cleanup (removes `DeviceNotRegistered` tokens)
- [x] `app/api/workflows/notifications+api.ts` — thin route exposing workflow handler
- [x] `app/_layout.tsx` — client-side push registration (permissions, token, listeners, Android channel)
- [x] Preferences API auto-creates defaults on first access (so workflow discovers new users)

### Rate Limiting
- [x] Global: Upstash Redis sliding window (100 req / 15 min per IP)
- [x] AI: per-user daily limits (10 free / 100 pro) via `ai_chat_usage` table

### Web (replaces anchrapp-web)
- [x] `app/(marketing)/index.tsx` — landing page
- [x] `app/(marketing)/privacy.tsx` — privacy policy
- [x] `app/(marketing)/terms.tsx` — terms of service
- [x] `public/.well-known/` — Apple app site association + Android asset links

### Frontend Updates
- [x] Supabase JS removed entirely
- [x] Axios removed — using native `fetch()` with platform-aware base URL
- [x] `lib/api.ts` — typed API client for all endpoints
- [x] `ImageSelector` — removed Supabase Storage, uses local URI
- [x] Settings screen wired to notification preferences API
- [x] Sign out button with confirmation
- [x] Daily verse time picker
- [x] All `response.data` unwrapped (fetch returns data directly, not axios wrapper)

### Environment
- [x] dotenv hierarchy: `.env` → `.env.development` → `.env.development.local`
- [x] Secrets only in `.local` files (gitignored)
- [x] Non-secret URLs in committed env files

---

## What's Left

### Before First Deploy

- [ ] **Set up Neon project** — create database, get `DATABASE_URL`
- [ ] **Run `npx drizzle-kit push`** — create all tables on Neon
- [ ] **Data migration** — `pg_dump --data-only` from Supabase → `psql` import to Neon
  - Critical: `verse_library` table (used by verse of the day theme selection)
  - Verify row counts match for all 11 tables
- [ ] **Set up Upstash** — create Redis database + QStash. Get tokens
- [ ] **Set up Cloudflare R2** — create bucket, create API token, get account ID
- [ ] **Generate `BETTER_AUTH_SECRET`** — `openssl rand -base64 32`
- [ ] **Configure EAS Secrets** — set all production env vars via `eas secret:create`
- [ ] **Schedule QStash cron** — `POST https://anchrapp.io/api/workflows/notifications` every minute
- [ ] **Fix `apple-app-site-association`** — `appID` must match actual bundle ID in `app.json`
- [ ] **Add `associatedDomains`** to `app.json` iOS config for universal links

### Storage (done)

- [x] `generate-chapter-audio+api.ts` uploads MP3 to R2 and stores the public URL
- [x] `ImageSelector` custom upload uses presigned URL → direct upload to R2

### Nice to Have

- [ ] Error boundary / loading states on auth screens
- [ ] Bookmarks screen — currently a stub with TODO comments, needs to call favorites API
- [ ] Reading progress tracking — schema exists but no API routes or UI
- [ ] User profiles — schema exists but no API routes or UI
- [ ] Shared verses — schema exists but no API routes or UI
- [ ] Chapter completion notifications — preference exists but not implemented in workflow
- [ ] Onboarding flow for new users (timezone detection, notification opt-in)

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Neon over Supabase Postgres | Serverless HTTP driver, no connection pooling needed, works in Expo API Routes |
| Better Auth over Supabase Auth | Framework-agnostic, Drizzle adapter, Expo plugin for native token storage |
| Expo API Routes over Express | One project, one deploy. No separate server to maintain |
| Upstash Workflow over node-cron | Durable steps with retries, parallel fan-out, no long-running process needed |
| Upstash Redis over in-memory rate limiting | Survives serverless cold starts, shared across instances |
| Cloudflare R2 over Supabase Storage | S3-compatible, zero egress fees, presigned uploads for client-side direct upload |
| `@/` path alias → root | Single flat import convention, `@/server/db`, `@/lib`, `@/server/services` |

## Deployment Target

- **Native**: EAS Build → App Store / Play Store
- **Web + API**: EAS Hosting (server output mode)
- **Cron**: QStash schedule → `POST /api/workflows/notifications` every minute
- **DNS**: Point `anchrapp.io` to EAS Hosting
