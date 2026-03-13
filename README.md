# Anchor ⚓️

A Bible app for reading scripture, creating verse images, and growing in faith — with AI-powered study tools and daily notifications.

## Features

- 📖 **Daily Verse** — themed by day of week, shareable as images
- 📚 **Full Bible** — 5 translations (WEB, KJV, ASV, FBV, NLT) via API.Bible
- 🤖 **AI Study Tools** — verse explanations, related verses, study questions (OpenAI)
- 🎧 **Audio Bible** — chapter-by-chapter TTS (OpenAI)
- 🎨 **Verse Cards** — preset backgrounds + custom image uploads
- 🔖 **Favorites** — save and organize verses
- 🔔 **Push Notifications** — daily verse + streak reminders (timezone-aware)
- 🌐 **Web** — landing page, privacy policy, terms of service

## Tech Stack

- **Runtime** — [Bun](https://bun.sh)
- **Framework** — [Expo Router](https://docs.expo.dev/router/introduction/) (native iOS/Android + web + API routes)
- **Database** — [Neon Postgres](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team)
- **Auth** — [Better Auth](https://www.better-auth.com) with Expo plugin
- **Scheduled Jobs** — [Upstash Workflow](https://upstash.com/docs/workflow) (durable notification pipeline)
- **Rate Limiting** — [Upstash Redis](https://upstash.com/docs/redis)
- **File Storage** — [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible, zero egress fees)
- **Push Notifications** — [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) + [expo-server-sdk](https://github.com/expo/expo-server-sdk-node)
- **Linting** — [oxlint](https://oxc.rs/docs/guide/usage/linter)
- **Formatting** — [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- **Testing** — [bun test](https://bun.sh/docs/cli/test)

## Getting Started

See [SETUP.md](./SETUP.md) for the full local development guide.

```bash
bun install
cp .env.development.local.example .env.development.local  # fill in secrets
bun run db:generate && bun run db:migrate                  # push schema to Neon
bun start                                                   # start Expo dev server
```

## Environment

| File | Purpose | Git |
|---|---|---|
| `.env` | Shared defaults | Committed |
| `.env.development` | Dev URLs | Committed |
| `.env.production` | Prod URLs | Committed |
| `.env.development.local` | Dev secrets | Ignored |
| `.env.production.local` | Prod secrets | Ignored |
| `.env.local` | Personal overrides | Ignored |

## Project Structure

```
app/                 Expo Router pages + API routes
  (marketing)/       Web-only: landing, privacy, terms
  (tabs)/            Native app: home, bible, anchor, bookmarks, settings
  api/               Server-side API routes
    ai/              explain, related, study-questions
    audio/           generate-chapter-audio
    auth/            Better Auth catch-all
    favorites/       CRUD
    images/          presets, random, delete
    notifications/   register-token, preferences, test
    verses/          verse-of-day, search, chapter, reference, versions
    workflows/       Upstash Workflow (notifications)
server/
  db/                Drizzle schema + Neon connection
  services/          Business logic (bible, AI, images, notifications)
lib/                 Shared utilities (auth, rate limiting, API helpers)
components/          React Native components
public/              Static files (.well-known)
_archive/            Old backend + web projects (reference only)
```

## Scripts

```bash
bun start              # Expo dev server
bun run web            # Web only
bun run ios            # iOS simulator
bun run android        # Android emulator

bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Run migrations on Neon
bun run db:studio      # Open Drizzle Studio

bun run fmt            # Format with oxfmt
bun run lnt            # Lint with oxlint
bun run typecheck      # TypeScript check
bun test               # Run tests

bun run qstash:local   # Local QStash dev server
```

## Docs

- [SETUP.md](./SETUP.md) — local development setup
- [MIGRATION.md](./MIGRATION.md) — migration status + what's left to do

## License

MIT
