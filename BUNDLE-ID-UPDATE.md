# Bundle ID Update Guide

## ✅ Updated Bundle Identifier

Your app now uses: **`io.anchrapp.anchor`**

## Files Updated

### 1. Frontend Configuration
- ✅ `frontend-new/app.config.js` - Updated iOS bundleIdentifier and Android package
- ✅ `frontend-new/eas.json` - Created with proper build configurations

### 2. Website Configuration  
- ✅ `anchrapp-web/public/.well-known/apple-app-site-association` - Updated for iOS Universal Links
- ✅ `anchrapp-web/public/.well-known/assetlinks.json` - Updated for Android App Links

## 🔴 IMPORTANT: Action Required

### 1. Update Apple App Site Association with Your Team ID

In `anchrapp-web/public/.well-known/apple-app-site-association`, replace `TEAMID` with your actual Apple Developer Team ID:

**Before:**
```json
"appID": "TEAMID.io.anchrapp.anchor"
```

**After:**
```json
"appID": "YOUR_TEAM_ID.io.anchrapp.anchor"
```

**Where to find your Team ID:**
- Go to https://developer.apple.com/account
- Click on "Membership" in the sidebar
- Your Team ID is listed there (10-character code like "A1B2C3D4E5")

### 2. Update Supabase Redirect URLs

In your Supabase dashboard (Authentication → URL Configuration):

**Add these redirect URLs:**
- `io.anchrapp.anchor://auth/callback` (for iOS)
- `https://anchrapp.io/auth/callback` (for web/universal links)

**Site URL:**
- `https://anchrapp.io`

### 3. Redeploy Website to Netlify

After updating the Team ID, redeploy your website:

```bash
cd anchrapp-web
./deploy.sh
```

This ensures the updated Universal Links configuration is live.

### 4. Get Android SHA-256 Fingerprint (When Ready)

When you build your Android app, you'll need to add the SHA-256 certificate fingerprint to `assetlinks.json`.

**To get the fingerprint:**
```bash
# For development/debug builds
cd android && ./gradlew signingReport

# For production builds
keytool -list -v -keystore your-release-key.keystore
```

Then add the fingerprint to `anchrapp-web/public/.well-known/assetlinks.json`.

## Next Steps for Building

### For iOS (TestFlight/App Store):
1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Configure: `eas build:configure`
4. Build for iOS: `eas build --platform ios`
5. Submit to TestFlight: `eas submit --platform ios`

### For Android (Google Play):
1. Build for Android: `eas build --platform android`
2. Submit to Google Play: `eas submit --platform android`

## Important Notes

⚠️ **Bundle ID is permanent** - Once you submit to App Store/Play Store, you cannot change it without creating a new app listing.

✅ **Universal Links** - With the new Bundle ID and proper Team ID, your email confirmation links will work seamlessly.

✅ **Associated Domains** - Make sure your App ID in Apple Developer has "Associated Domains" enabled with `applinks:anchrapp.io`.

## Verification

Test Universal Links:
1. Build your app for TestFlight or a real device
2. Send yourself a Supabase auth email
3. Click the link - it should open directly in your app (not browser)

---

Last Updated: January 27, 2026
Bundle ID: `io.anchrapp.anchor`
