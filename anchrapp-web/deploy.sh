#!/bin/bash

echo "🚀 Deploying Anchor Website to Netlify..."
echo ""

# Check if netlify is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Navigate to web directory
cd "$(dirname "$0")"

echo "📦 Deploying to production..."
netlify deploy --prod --dir=public

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Netlify dashboard and add your domain 'anchrapp.io'"
echo "2. Update DNS records at your domain registrar"
echo "3. Update Supabase Site URL to: https://anchrapp.io/auth/callback"
echo "4. Test sign-up with a new email!"
echo ""
