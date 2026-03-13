# Quick Start

Get Anchor running locally in under 10 minutes.

## 1. Install

```bash
git clone https://github.com/Apollosol13/Anchor.git
cd Anchor
bun install
```

## 2. Get API Keys

Create free accounts at:

- [neon.tech](https://neon.tech) — Postgres database
- [scripture.api.bible](https://scripture.api.bible) — Bible verses
- [platform.openai.com](https://platform.openai.com) — AI features (optional for initial dev)

## 3. Configure Secrets

```bash
cp .env.development.local.example .env.development.local
```

Fill in at minimum:

```env
DATABASE_URL=postgresql://...          # from Neon dashboard
BETTER_AUTH_SECRET=change-me           # openssl rand -base64 32
BIBLE_API_KEY=your-key                 # from API.Bible
```

## 4. Set Up Database

```bash
bun run db:generate   # generate migrations from Drizzle schema
bun run db:migrate    # apply to Neon
```

## 5. Start

```bash
bun start
```

- Press `w` for web — `http://localhost:8081`
- Press `i` for iOS simulator
- Press `a` for Android emulator

## What You Get

| Feature                | How it works                                                 |
| ---------------------- | ------------------------------------------------------------ |
| **Daily Verse**        | Themed by day of week, cached in DB, fetched from API.Bible  |
| **Bible Reader**       | Browse books + chapters, 5 translations                      |
| **AI Explanations**    | OpenAI GPT-3.5 with per-user daily rate limits               |
| **Verse Images**       | Preset backgrounds + custom uploads, share/download          |
| **Audio Bible**        | OpenAI TTS, cached per chapter                               |
| **Push Notifications** | Expo push tokens + Upstash Workflow scheduling               |
| **Auth**               | Email/password via Better Auth, session-protected API routes |
| **Web Pages**          | Landing page, privacy policy, terms of service               |

## Key Scripts

```bash
bun start              # dev server
bun run db:studio      # browse database in browser
bun run fmt            # format code
bun run lnt            # lint code
bun run typecheck      # check types
bun test               # run tests
bun run sanity         # run all checks
```

## Next Steps

- Read [SETUP.md](./SETUP.md) for the full setup guide with troubleshooting
- Read [MIGRATION.md](./MIGRATION.md) for migration status and what's left to build
- Read [README.md](./README.md) for project overview and architecture
