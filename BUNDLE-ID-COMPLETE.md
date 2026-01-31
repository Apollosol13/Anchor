# ✅ Bundle ID Setup Complete!

## What Was Done

### 1. ✅ Apple Developer Configuration
- **App ID Created**: `io.anchrapp.anchor`
- **Team ID**: `6YZSFD7L5N`
- **Capabilities Enabled**:
  - ✅ Associated Domains
  - ✅ Push Notifications
  - ✅ App Groups

### 2. ✅ Code Updates
- **`app.config.js`**: Updated iOS bundleIdentifier and Android package
- **`eas.json`**: Created with proper build configurations
- **Apple App Site Association**: Updated with Team ID `6YZSFD7L5N.io.anchrapp.anchor`
- **Android Asset Links**: Updated package name

### 3. ✅ Website Deployment
- **Deployed to**: https://anchrapp.io
- **Universal Links File**: https://anchrapp.io/.well-known/apple-app-site-association
- **Status**: ✅ Live and verified with correct Team ID

## 🔴 Final Steps Required

### 1. Update Supabase Redirect URLs

Go to your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://anchrapp.io
```

**Redirect URLs (Add both):**
```
io.anchrapp.anchor://auth/callback
https://anchrapp.io/auth/callback
```

**Remove old redirect URLs with `com.anchor.bible`**

### 2. Configure Associated Domains in Apple Developer

1. Go to https://developer.apple.com/account/resources/identifiers
2. Click on your App ID: `io.anchrapp.anchor`
3. Click on "Associated Domains"
4. Verify it shows: `applinks:anchrapp.io`

## 🚀 Ready to Build!

Your app is now ready for TestFlight and App Store submission!

### Build for iOS (TestFlight):

```bash
cd frontend-new

# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

### Build for Android (Google Play):

```bash
cd frontend-new

# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## Testing Universal Links

Once your app is on TestFlight:

1. Install the app on a real device (not simulator)
2. Sign up with a new email
3. Check your email for the confirmation link
4. Click the link - it should open **directly in your app** (not Safari)
5. ✅ If it opens in the app, Universal Links are working!

## Important Notes

✅ **Bundle ID**: `io.anchrapp.anchor` (permanent, cannot be changed)
✅ **Team ID**: `6YZSFD7L5N` (configured in Universal Links)
✅ **Domain**: `anchrapp.io` (with proper DNS and SSL)
✅ **Website**: Deployed with correct configuration files

## Verification Checklist

- [x] Apple App ID created with `io.anchrapp.anchor`
- [x] Associated Domains capability enabled
- [x] Push Notifications capability enabled
- [x] App Groups capability enabled
- [x] Team ID added to apple-app-site-association
- [x] Website deployed to Netlify
- [x] Universal Links file accessible at anchrapp.io
- [ ] Supabase redirect URLs updated
- [ ] App built with EAS
- [ ] Tested on real device

---

**Last Updated**: January 27, 2026
**Bundle ID**: `io.anchrapp.anchor`
**Team ID**: `6YZSFD7L5N`
**Domain**: `anchrapp.io`
