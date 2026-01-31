# Setting Up Universal Links with anchrapp.io

This guide walks you through deploying the website and configuring everything for proper email authentication.

## Step 1: Deploy Website to Netlify

1. **Install Netlify CLI** (if you haven't already):
   ```bash
   npm install -g netlify-cli
   ```

2. **Navigate to the web directory**:
   ```bash
   cd /Users/brennenstudenc/Desktop/Anchor/anchrapp-web
   ```

3. **Login to Netlify**:
   ```bash
   netlify login
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod --dir=public
   ```
   
   Or use the deploy script:
   ```bash
   ./deploy.sh
   ```
   
   Follow the prompts:
   - Link to existing site? **No**
   - What's your site name? **anchrapp** (or whatever you want)

5. After deployment, Netlify will give you a URL like: `https://anchrapp.netlify.app`

## Step 2: Point Your Domain to Netlify

1. Go to your **Netlify Dashboard** → Your Site → **Domain management**

2. Click **"Add custom domain"**

3. Enter: `anchrapp.io`

4. Netlify will give you DNS records to add. Go to your domain registrar and add:
   - Type: **A** or **CNAME** (depends on what Netlify tells you)
   - Value: The IP/domain Netlify provides

5. Wait for DNS to propagate (5-60 minutes)

6. Once live, verify these URLs work:
   - `https://anchrapp.io` (homepage)
   - `https://anchrapp.io/auth/callback` (auth page)
   - `https://anchrapp.io/.well-known/apple-app-site-association` (should show JSON)

## Step 3: Update Supabase Configuration

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. Set **Site URL** to:
   ```
   https://anchrapp.io/auth/callback
   ```

3. Set **Redirect URLs** to:
   ```
   https://anchrapp.io/**
   anchor://**
   ```

4. **Save changes**

## Step 4: Update Apple Developer Account (Later, for Production)

When you're ready to submit to the App Store:

1. Get your **Team ID** from Apple Developer account
2. Update `anchrapp-web/public/.well-known/apple-app-site-association`:
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [
         {
           "appID": "YOUR_TEAM_ID.com.anchor.bible",
           "paths": ["/auth/*", "/share/*"]
         }
       ]
     }
   }
   ```
3. Redeploy the website with `netlify deploy --prod --dir=public`

## Step 5: Test the Full Flow

1. **Restart Expo** (to pick up new app.config.js):
   ```bash
   cd /Users/brennenstudenc/Desktop/Anchor/frontend-new
   npx expo start --clear
   ```

2. **Test sign-up** with a new email address

3. **Check your email** and click the confirmation link

4. It should now:
   - Open `https://anchrapp.io/auth/callback`
   - Automatically redirect to `anchor://auth/callback`
   - Open your app and log you in!

## Troubleshooting

- **Website not loading?** Wait for DNS propagation (up to 1 hour)
- **Apple App Site Association not working?** Make sure the file has no `.json` extension and is served with `Content-Type: application/json`
- **App not opening?** The custom scheme `anchor://` will still work as fallback
- **Still showing localhost?** Make sure you saved Supabase URL configuration changes

---

## What This Does

✅ Professional landing page for your app  
✅ Proper email confirmation without Safari errors  
✅ Universal Links support for iOS/Android  
✅ Future-proof for App Store submission  
✅ No more "localhost" or "invalid address" errors  

Let me know if you hit any issues! 🚀
