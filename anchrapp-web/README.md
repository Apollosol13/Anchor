# Anchor Web

Simple landing page and authentication redirect handler for the Anchor Bible app.

## What's This?

This website serves as:
1. **Landing page** for anchrapp.io
2. **Authentication callback handler** for email confirmations
3. **Universal Links configuration** for iOS/Android deep linking

## Files

- `public/index.html` - Homepage
- `public/auth/callback.html` - Handles Supabase email confirmation redirects
- `public/.well-known/apple-app-site-association` - iOS Universal Links config
- `public/.well-known/assetlinks.json` - Android App Links config

## Deployment

This is deployed to Netlify and serves as the public-facing website for the Anchor app.

### Deploy to Netlify:

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=public
```

Or use the deploy script:
```bash
./deploy.sh
```

Then point your domain `anchrapp.io` to Netlify in your domain registrar settings.
