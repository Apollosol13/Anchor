# Migration Status: Supabase → Neon + Better Auth + Expo API Routes

## Overview

Anchor was originally split across 3 projects:

| Project         | Stack                          | Hosted on | Status                                  |
| --------------- | ------------------------------ | --------- | --------------------------------------- |
| `backend/`      | Express + Supabase + node-cron | Railway   | **Archived** → `_archive/backend/`      |
| `frontend/`     | Expo + Supabase JS + Axios     | EAS       | **Merged into root**                    |
| `anchrapp-web/` | Static HTML                    | Netlify   | **Archived** → `_archive/anchrapp-web/` |

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
│   ├── (tabs)/                   # Native app tabs: home, bible, anchor, bookmarks, profile
│   ├── api/
│   │   ├── ai/                   # explain, related, study-questions
│   │   ├── audio/                # generate-chapter-audio
│   │   ├── auth/                 # [...all] Better Auth catch-all
│   │   ├── favorites/            # CRUD (list, add, remove)
│   │   ├── health+api.ts
│   │   ├── images/               # presets (list, create), random, [id] (delete)
│   │   ├── notifications/        # register-token, preferences, test
│   │   ├── uploads/              # presigned URL for client uploads
│   │   ├── verses/               # verse-of-day, search, chapter, reference, versions
│   │   └── workflows/            # notifications (Upstash Workflow)
│   ├── auth/login.tsx            # Login / signup screen
│   ├── book/[bookName].tsx       # Chapter selection grid
│   ├── chapter/[bookName]/[chapter].tsx  # Chapter reader
│   ├── edit-profile.tsx
│   ├── notification-settings.tsx
│   ├── paywall.tsx
│   ├── privacy-security.tsx
│   ├── search.tsx
│   └── settings.tsx
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
│   ├── api.ts                    # Client-side fetch wrapper (all API endpoints)
│   ├── api-helpers.ts            # Server-side helpers (json, error, auth, rate limit)
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client + useSession, signIn, signUp, signOut, signInWithApple
│   ├── constants/bibleBooks.ts   # Bible book metadata + navigation helpers
│   ├── contexts/SubscriptionContext.tsx  # Subscription state (stubbed — all users are "free")
│   ├── notifications.ts          # Client notification service (registration, preferences via API)
│   ├── rate-limit.ts             # Upstash Redis rate limiter
│   └── storage.ts                # BibleVersionStorage (AsyncStorage) + R2 helpers (server)
├── components/                   # React Native components
│   ├── AnchorLogo.tsx
│   ├── ImageSelector.tsx         # Background picker with presigned R2 upload
│   ├── ShareModal.tsx
│   └── VerseCard.tsx             # Verse display with bookmark toggle via favoritesApi
├── public/.well-known/           # iOS Universal Links + Android App Links
├── _archive/                     # Old projects (reference only)
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
- [x] `app/auth/login.tsx` — unified login/signup screen with Apple Sign-In
- [x] `app/_layout.tsx` — protected route logic using `useSession()`
- [x] All screens use `useSession()` directly (no custom AuthContext/Provider)
- [x] `signInWithApple()` helper in `auth-client.ts` (native Expo → Better Auth social)

### API Routes (all backend endpoints ported)

| Route | Methods | Auth | Client Function | Notes |
|-------|---------|------|-----------------|-------|
| `/api/verses/verse-of-day` | GET | No | `verseApi.getVerseOfTheDay()` | version, date, timezone params |
| `/api/verses/chapter/[bookName]/[chapter]` | GET | No | `verseApi.getChapter()` | |
| `/api/verses/search/[query]` | GET | No | `verseApi.searchVerses()` | |
| `/api/verses/[reference]` | GET | No | `verseApi.getVerse()` | |
| `/api/verses/versions` | GET | No | `verseApi.getVersions()` | |
| `/api/ai/explain` | POST | Yes | `aiApi.explainVerse()` | 10 free / 100 pro per day |
| `/api/ai/related` | POST | Yes | `aiApi.getRelatedVerses()` | |
| `/api/ai/study-questions` | POST | Yes | `aiApi.getStudyQuestions()` | |
| `/api/images/presets` | GET, POST | No/Yes | `imageApi.getPresets()` | POST has no client wrapper (admin) |
| `/api/images/random` | GET | No | `imageApi.getRandomPreset()` | |
| `/api/images/[id]` | DELETE | Yes | `imageApi.deletePreset()` | |
| `/api/favorites` | POST | Yes | `favoritesApi.addFavorite()` | 409 on duplicate |
| `/api/favorites/[userId]` | GET, DELETE | Yes | `favoritesApi.getFavorites()`, `.removeFavorite()` | DELETE param is favorite ID |
| `/api/audio/generate-chapter-audio` | POST | Yes | `audioApi.generateChapterAudio()` | OpenAI TTS, DB cached |
| `/api/reading-progress` | GET, POST, DELETE | Yes | `readingProgressApi.*` | Unique constraint on (user, book, chapter) |
| `/api/account` | DELETE | Yes | `accountApi.deleteAccount()` | Cascade deletes all user data |
| `/api/notifications/register-token` | POST | Yes | `notificationApi.registerToken()` | |
| `/api/notifications/preferences` | GET, PUT | Yes | `notificationApi.getPreferences()`, `.updatePreferences()` | Auto-creates defaults |
| `/api/notifications/test` | POST | Yes | `notificationApi.sendTest()` | |
| `/api/uploads/presign` | POST | Yes | `uploadApi.getPresignedUrl()` | R2 presigned URL |
| `/api/workflows/notifications` | POST | — | — | Upstash Workflow handler (cron) |
| `/api/health` | GET | No | — | Health check |
| `/api/auth/[...all]` | * | — | `authClient` | Better Auth catch-all |

### Notifications

- [x] `server/services/notificationService.ts` — consolidated service with:
  - `sendToUser()` — core push via expo-server-sdk
  - `sendTestNotification()` — test wrapper
  - `findDailyVerseRecipients()` — DB query + timezone matching
  - `findStreakReminderRecipients()` — DB query + 20:00 matching
  - `notificationWorkflow` — Upstash Workflow with durable parallel steps
  - Stale token cleanup (removes `DeviceNotRegistered` tokens)
- [x] `app/api/workflows/notifications+api.ts` — thin route exposing workflow handler
- [x] `lib/notifications.ts` — client service using `notificationApi` (no Supabase)
- [x] `app/_layout.tsx` — client-side push registration (permissions, token, Android channel)
- [x] Preferences API auto-creates defaults on first access

### Rate Limiting

- [x] Global: Upstash Redis sliding window (100 req / 15 min per IP)
- [x] AI: per-user daily limits (10 free / 100 pro) via `ai_chat_usage` table

### Web (replaces anchrapp-web)

- [x] `app/(marketing)/index.tsx` — landing page
- [x] `app/(marketing)/privacy.tsx` — privacy policy
- [x] `app/(marketing)/terms.tsx` — terms of service
- [x] `public/.well-known/` — Apple app site association + Android asset links

### Frontend Updates

- [x] Supabase JS removed entirely — zero references in active code
- [x] Axios removed — using native `fetch()` with platform-aware base URL
- [x] `lib/api.ts` — typed API client for all endpoints
- [x] `ImageSelector` — uses presigned R2 upload via `uploadApi`
- [x] `VerseCard` — bookmarks via `favoritesApi` (no direct DB queries)
- [x] `bookmarks.tsx` — fetches/deletes via `favoritesApi`
- [x] Settings screen wired to notification preferences API
- [x] Sign out via Better Auth `signOut()` with confirmation
- [x] Daily verse time picker
- [x] All screens use `useSession()` from Better Auth directly (no AuthContext wrapper)
- [x] All import paths use `@/` alias (no `../src/` paths)
- [x] Reading progress — `book/[bookName].tsx` and `chapter/[bookName]/[chapter].tsx` wired to `readingProgressApi`
- [x] Account deletion — `privacy-security.tsx` calls `accountApi.deleteAccount()` then signs out
- [x] `app.config.js` — cleaned up stale Supabase env references

### Storage

- [x] `generate-chapter-audio+api.ts` uploads MP3 to R2 and stores the public URL
- [x] `ImageSelector` custom upload uses presigned URL → direct upload to R2
- [x] `lib/storage.ts` — `BibleVersionStorage` uses AsyncStorage, R2 helpers use S3 SDK

### Environment

- [x] dotenv hierarchy: `.env` → `.env.development` → `.env.development.local`
- [x] Secrets only in `.local` files (gitignored)
- [x] Non-secret URLs in committed env files

---

## What's Left

### Nice to Have

- [ ] User profiles — schema exists but no API routes or UI
- [ ] Shared verses — schema exists but no API routes or UI
- [ ] Chapter completion notifications — preference exists but not implemented in workflow
- [ ] Onboarding flow for new users (timezone detection, notification opt-in)
- [ ] Subscription/paywall — `SubscriptionContext` is stubbed (all users "free"), paywall UI exists but packages are hardcoded
- [ ] Error boundary / loading states on auth screens

---

## Architecture Decisions

| Decision                                   | Rationale                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| Neon over Supabase Postgres                | Serverless HTTP driver, no connection pooling needed, works in Expo API Routes   |
| Better Auth over Supabase Auth             | Framework-agnostic, Drizzle adapter, Expo plugin for native token storage        |
| Expo API Routes over Express               | One project, one deploy. No separate server to maintain                          |
| Upstash Workflow over node-cron            | Durable steps with retries, parallel fan-out, no long-running process needed. QStash cron triggers every 15 min (matches time picker granularity) |
| Upstash Redis over in-memory rate limiting | Survives serverless cold starts, shared across instances                         |
| Cloudflare R2 over Supabase Storage        | S3-compatible, zero egress fees, presigned uploads for client-side direct upload |
| `@/` path alias → root                     | Single flat import convention, `@/server/db`, `@/lib`, `@/server/services`       |
| No AuthContext/Provider                     | Better Auth's `useSession()` manages state internally — no wrapper needed        |

## Auth Pattern

Better Auth's `createAuthClient("better-auth/react")` provides reactive hooks directly:

```tsx
// Reading session state — use in any component, no Provider needed
import { useSession } from "@/lib/auth-client";
const { data: session, isPending } = useSession();
const user = session?.user;

// Auth actions — import and call directly
import { authClient, signOut, signInWithApple } from "@/lib/auth-client";
await authClient.signIn.email({ email, password });
await authClient.signUp.email({ email, password, name: "" });
await signOut();
await signInWithApple();
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full iOS and web/API deployment instructions.
