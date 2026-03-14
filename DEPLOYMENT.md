# Deployment

## Overview

| Target        | Platform    | Command                                    | URL                                                  |
| ------------- | ----------- | ------------------------------------------ | ---------------------------------------------------- |
| **iOS App**   | App Store   | `eas build` + `eas submit`                 | App Store (ASC ID: `6758559895`)                     |
| **Web + API** | EAS Hosting | `eas deploy`                               | `https://anchrapp.io`                                |
| **Cron**      | QStash      | `bun run scripts/setup-qstash-schedule.ts` | Triggers `/api/workflows/notifications` every 15 min |

The native iOS app and the web + API server are deployed independently. The iOS app talks to the API at `EXPO_PUBLIC_API_URL` (`https://anchrapp.io`), so the **web/API must be deployed first** (or simultaneously) for the native app to function.

---

## Before First Deploy

- [ ] **Set up Neon project** — create database, get `DATABASE_URL`
- [ ] **Run `npx drizzle-kit push`** — create all tables on Neon
- [ ] **Data migration** — `pg_dump --data-only` from Supabase → `psql` import to Neon
  - Critical: `verse_library` table (used by verse of the day theme selection)
  - Verify row counts match for all 11 tables
- [ ] **Set up Upstash** — create Redis database + QStash. Get tokens
- [ ] **Set up Cloudflare R2** — create bucket, create API token, get account ID
- [ ] **Generate `BETTER_AUTH_SECRET`** — `openssl rand -base64 32`
- [ ] **Configure EAS Secrets** — set all production env vars via `eas secret:create`
- [ ] **Create QStash schedule** — run `bun run scripts/setup-qstash-schedule.ts` (needs `QSTASH_TOKEN` + `APP_URL`)

## Deploy Order (First Time)

1. **Set up external services** — Neon, Upstash, R2, OpenAI (see checklist above)
2. **Run migrations** — `npx drizzle-kit push` to create tables on Neon
3. **Migrate data** — `pg_dump` from Supabase → `psql` import to Neon
4. **Set EAS secrets** — all production env vars (see list above)
5. **Deploy web + API** — `bun run web:export && bun run web:deploy:prod`
6. **Configure DNS** — point `anchrapp.io` to EAS Hosting
7. **Verify API** — `curl https://anchrapp.io/api/health`
8. **Set up QStash schedule** — `bun run scripts/setup-qstash-schedule.ts`
9. **Build + submit iOS** — `eas build --profile production --platform ios --auto-submit`

## Subsequent Deploys

```bash
# API/web changes only (no native code changes)
bun run web:export && bun run web:deploy:prod

# Native changes (new native modules, app.config.js changes, version bump)
eas build --profile production --platform ios --auto-submit

# Both
bun run web:export && bun run web:deploy:prod
eas build --profile production --platform ios --auto-submit
```

## iOS Deployment

### Prerequisites

- Apple Developer account with App Store Connect access
- EAS CLI installed (`npm install -g eas-cli`)
- Logged in to EAS (`eas login`)
- Registered devices for preview builds (`eas device:create`)

### Build Profiles

Defined in `eas.json`:

| Profile       | Purpose                    | Distribution                  |
| ------------- | -------------------------- | ----------------------------- |
| `development` | Dev client with hot reload | Internal (registered devices) |
| `preview`     | QA testing on simulator    | Internal (simulator)          |
| `production`  | App Store release          | App Store                     |

### Commands

```bash
# Development build (registered devices only)
eas build --profile development --platform ios

# Preview build (iOS simulator)
eas build --profile preview --platform ios
# shortcut:
bun run build:ios:preview

# Production build (App Store)
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios

# Build + submit in one step
eas build --profile production --platform ios --auto-submit
```

### EAS Secrets

Production secrets must be set via EAS before building. These are injected at build time and available to the API routes at runtime:

```bash
# Database
eas secret:create --name DATABASE_URL --value "postgresql://..."

# Auth
eas secret:create --name BETTER_AUTH_SECRET --value "$(openssl rand -base64 32)"

# Upstash (Redis + QStash)
eas secret:create --name UPSTASH_REDIS_REST_URL --value "https://..."
eas secret:create --name UPSTASH_REDIS_REST_TOKEN --value "..."
eas secret:create --name QSTASH_TOKEN --value "..."
eas secret:create --name QSTASH_CURRENT_SIGNING_KEY --value "..."
eas secret:create --name QSTASH_NEXT_SIGNING_KEY --value "..."

# Cloudflare R2
eas secret:create --name CLOUDFLARE_ACCOUNT_ID --value "..."
eas secret:create --name R2_ACCESS_KEY_ID --value "..."
eas secret:create --name R2_SECRET_ACCESS_KEY --value "..."
eas secret:create --name R2_BUCKET_NAME --value "..."
eas secret:create --name R2_PUBLIC_URL --value "https://..."

# OpenAI (AI features + TTS)
eas secret:create --name OPENAI_API_KEY --value "sk-..."
```

### Version Management

Versions are managed remotely by EAS (`appVersionSource: "remote"` in `eas.json`). Production builds auto-increment the build number. To bump the app version, update `version` in `app.config.js`.

---

## Web + API Deployment (EAS Hosting)

The web build and all API routes (`app/api/**/*+api.ts`) are deployed together as a single server bundle. This is required for the native app to work — without it, all API calls fail.

### Prerequisites

- `app.config.js` has `web.output: "server"` (already configured)
- EAS CLI installed

### Commands

```bash
# Export the web + server bundle
bun run web:export

# (Optional) Remove source maps to reduce bundle size
bun run web:export:delete-maps

# Deploy to EAS Hosting (production)
bun run web:deploy:prod
# equivalent to: npx eas-cli@latest deploy --prod
```

### DNS

Point `anchrapp.io` to EAS Hosting. EAS will provide the DNS target after first deploy. The domain must match:

- `BETTER_AUTH_URL` in `.env.production`
- `EXPO_PUBLIC_API_URL` in `.env.production`
- `associatedDomains` in `app.config.js` (for Universal Links)

### What Gets Deployed

- **Web pages**: `(marketing)/*` — landing page, privacy, terms
- **API routes**: All `+api.ts` files — auth, verses, favorites, AI, notifications, etc.
- **Static assets**: `public/` — `.well-known/` for Universal Links / App Links

The native app screens (`(tabs)/*`, `chapter/*`, etc.) are **not** served by the web deploy — they're bundled into the iOS binary by EAS Build.

---

## Post-Deploy: QStash Cron

After the web API is live, set up the notification cron schedule:

```bash
# Requires QSTASH_TOKEN in environment or .env.production.local
APP_URL=https://anchrapp.io bun run scripts/setup-qstash-schedule.ts
```

This creates a QStash schedule that POSTs to `/api/workflows/notifications` every 15 minutes, triggering the Upstash Workflow for daily verse and streak reminder notifications.
