# Quick Netlify Deployment Guide

## Method 1: Using Netlify CLI (Recommended)

### First Time Setup

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Navigate to project
cd /Users/brennenstudenc/Desktop/Anchor/anchrapp-web

# 4. Deploy
netlify deploy --prod --dir=public
```

Or just run:
```bash
./deploy.sh
```

---

## Method 2: Drag & Drop (Easiest for First Deployment)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag the `public` folder from `/Users/brennenstudenc/Desktop/Anchor/anchrapp-web/public`
4. Done! Netlify gives you a URL like `https://random-name.netlify.app`

---

## After First Deployment

### Add Your Custom Domain

1. In Netlify dashboard → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `anchrapp.io`
4. Netlify shows DNS records to add

### Update DNS at Your Domain Registrar

Add the records Netlify provides:

**Example:**
- **Type:** A
- **Name:** @ (or leave blank)
- **Value:** `75.2.60.5` (Netlify's IP - they'll tell you the current one)

**And/Or:**
- **Type:** CNAME
- **Name:** www
- **Value:** `your-site.netlify.app`

### Wait 5-60 minutes for DNS propagation

Check if live: `https://anchrapp.io`

---

## Update Supabase

Once `https://anchrapp.io` is live:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://anchrapp.io/auth/callback`
3. Set **Redirect URLs** to:
   ```
   https://anchrapp.io/**
   anchor://**
   ```
4. **Save**

---

## Test

1. Delete old test users from Supabase
2. Restart Expo: `npx expo start --clear`
3. Sign up with a new email
4. Click email confirmation link
5. Should open website → redirect to app! ✅

---

## Useful Commands

```bash
# Deploy to production
netlify deploy --prod --dir=public

# View site info
netlify status

# Open site in browser
netlify open

# View deploy logs
netlify logs
```

---

## Troubleshooting

- **Site not loading?** Wait for DNS (up to 1 hour)
- **HTTPS not working?** Netlify auto-provisions SSL, wait a few minutes
- **Well-known files not working?** Check `netlify.toml` has correct headers
- **App not opening?** Make sure Supabase URL config is saved

---

That's it! 🚀
