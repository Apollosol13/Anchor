# Push Notifications - Backend Setup Complete! 🔔

## ✅ What's Been Added

### 1. **Notification Service** (`src/services/notificationService.ts`)

- Sends push notifications via Expo Push API
- Handles daily verse notifications
- Chapter completion notifications
- Reading streak reminders
- Test notifications for development

### 2. **Notification Routes** (`src/routes/notifications.ts`)

- `POST /api/notifications/send-daily-verse` - Send daily verse to users
- `POST /api/notifications/chapter-completion` - Chapter completion notification
- `POST /api/notifications/streak-reminder` - Reading streak reminder
- `POST /api/notifications/test` - Test notification

### 3. **Updated Server** (`src/server.ts`)

- Added notifications router
- Integrated with existing Express app

### 4. **Package Updated** (`package.json`)

- Added `expo-server-sdk` for sending push notifications

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd /Users/brennenstudenc/Desktop/Anchor/backend
npm install
```

### Step 2: Run Database Schema

Go to Supabase SQL Editor and run:

```sql
-- File: backend/push-notifications-schema.sql
-- Creates push_tokens and notification_preferences tables
```

### Step 3: Start Backend

```bash
npm run dev
```

### Step 4: Test Notifications

Test that notifications work:

```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID"}'
```

---

## 🔄 Cron Job Setup (Daily Verse Notifications)

You need to call `/api/notifications/send-daily-verse` **every minute** to check for users scheduled at that time.

### Option 1: Vercel Cron (Recommended for Production)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/send-daily-verse",
      "schedule": "* * * * *"
    }
  ]
}
```

### Option 2: GitHub Actions (Free)

Create `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Notifications
on:
  schedule:
    - cron: "* * * * *" # Every minute
  workflow_dispatch:

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification endpoint
        run: |
          curl -X POST https://your-api.com/api/notifications/send-daily-verse
```

### Option 3: Supabase Edge Function

Create Supabase Edge Function with pg_cron:

```sql
SELECT cron.schedule(
  'send-daily-verse',
  '* * * * *',  -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://your-api.com/api/notifications/send-daily-verse',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

### Option 4: EasyCron (Simple SaaS)

1. Sign up at https://www.easycron.com/
2. Create cron job:
   - URL: `https://your-api.com/api/notifications/send-daily-verse`
   - Method: POST
   - Schedule: Every 1 minute

---

## 📱 How It Works

### Daily Verse Flow:

1. Cron job calls `/api/notifications/send-daily-verse` every minute
2. Backend checks current time (e.g., "09:00")
3. Queries users with `daily_verse_enabled: true` and `daily_verse_time: "09:00"`
4. Fetches their push tokens from `push_tokens` table
5. Sends notification via Expo Push API
6. Users receive "Your daily verse is ready! 📖"

### Chapter Completion Flow:

1. Frontend calls `/api/notifications/chapter-completion` when audio finishes
2. Backend sends notification to that user
3. User receives "Great job finishing Romans 8! 🎉"

### Streak Reminder Flow:

1. Your app tracks last reading time
2. After 20 hours, calls `/api/notifications/streak-reminder`
3. User receives "Don't break your 7-day streak! 🔥"

---

## 🧪 Testing

### Test Notification (Development)

```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID_HERE"}'
```

### Test Chapter Completion

```bash
curl -X POST http://localhost:3001/api/notifications/chapter-completion \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "bookName": "John",
    "chapter": 3
  }'
```

### Manually Trigger Daily Verse

```bash
curl -X POST http://localhost:3001/api/notifications/send-daily-verse
```

---

## 🔐 Security Notes

- Expo Push API is **free** with rate limits
- No additional auth needed (push tokens are unique)
- RLS policies protect user data
- Rate limiting already configured in Express

---

## 📊 Monitoring

Check backend logs to see:

- `🔔 Sending notification to user {userId}`
- `✅ Sent chunk of X notifications`
- `📬 Found X users to notify`
- `❌ Error messages` if something fails

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run SQL schema in Supabase
3. ✅ Start backend: `npm run dev`
4. ✅ Test notifications on physical iPhone
5. ⚠️ Set up cron job for production (choose one option above)
6. ⚠️ Deploy backend to production (Railway, Render, Vercel, etc.)

---

## 🆘 Troubleshooting

**Notifications not working?**

- Check push tokens exist in database
- Verify user has `daily_verse_enabled: true`
- Confirm time matches (24-hour format: "09:00")
- Check Expo Push Token is valid format: `ExponentPushToken[...]`
- Test on **physical device** (iOS Simulator doesn't support push)

**Cron job not running?**

- Verify cron schedule syntax
- Check backend logs for requests
- Test endpoint manually with curl

---

**🎉 Push Notifications are ready to go!**
