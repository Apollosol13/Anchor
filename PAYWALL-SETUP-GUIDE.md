# Paywall Integration Guide - Anchor Bible App

**Goal**: Implement subscription system with RevenueCat for iOS

**Pricing Tiers**:
- Weekly: $3.99/week
- Monthly: $12.99/month
- Yearly: $79.99/year ($6.67/month)

**Features to Gate**:
- Free: 50 AI chat messages/month
- Premium: Unlimited AI chat + future features

---

## Step 1: RevenueCat Account Setup ⏳ IN PROGRESS

### 1.1 Create Account
1. Go to [https://www.revenuecat.com/](https://www.revenuecat.com/)
2. Click "Get Started Free"
3. Sign up with email or GitHub
4. Choose "Free" plan (10K tracked revenue/month)

### 1.2 Create Your App Project
1. Click "Create New Project"
2. **Project Name**: Anchor Bible App
3. Click "Create Project"

### 1.3 Add iOS App
1. Click "Add App"
2. **Platform**: iOS
3. **App Name**: Anchor
4. **Bundle ID**: `io.anchrapp.anchor`
5. Leave **Shared Secret** blank for now (we'll add later)
6. Click "Save"

### 1.4 Get Your API Keys
After creating the app, you'll see:
- **Public API Key** (starts with `appl_...`)
- **Secret API Key** (starts with `sk_...`)

⚠️ **IMPORTANT**: Copy these and save them securely. You'll need them soon.

---

## Step 2: App Store Connect Setup ⏸️ PENDING

### 2.1 Sign in to App Store Connect
1. Go to [https://appstoreconnect.apple.com/](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account
3. Click "My Apps"

### 2.2 Create Your App (If Not Already Created)
1. Click the "+" button
2. Select "New App"
3. **Platform**: iOS
4. **Name**: Anchor
5. **Primary Language**: English (U.S.)
6. **Bundle ID**: io.anchrapp.anchor
7. **SKU**: anchor-bible-app
8. Click "Create"

### 2.3 Create Subscription Group
1. In your app, go to "Features" → "In-App Purchases"
2. Click the "+" button
3. Select "Subscription Group"
4. **Reference Name**: Anchor Premium
5. Click "Create"

### 2.4 Create Subscription Products

#### Weekly Subscription
1. Click "+" in your subscription group
2. **Reference Name**: Anchor Premium Weekly
3. **Product ID**: `io.anchrapp.anchor.weekly`
4. **Duration**: 1 Week
5. **Price**: $3.99 USD
6. **Subscription Display Name**: Weekly Premium Access
7. **Description**: Unlock unlimited AI chat and premium features
8. Click "Create"

#### Monthly Subscription
1. Click "+" in your subscription group
2. **Reference Name**: Anchor Premium Monthly
3. **Product ID**: `io.anchrapp.anchor.monthly`
4. **Duration**: 1 Month
5. **Price**: $12.99 USD
6. **Subscription Display Name**: Monthly Premium Access
7. **Description**: Unlock unlimited AI chat and premium features
8. Click "Create"

#### Yearly Subscription
1. Click "+" in your subscription group
2. **Reference Name**: Anchor Premium Yearly
3. **Product ID**: `io.anchrapp.anchor.yearly`
4. **Duration**: 1 Year
5. **Price**: $79.99 USD
6. **Subscription Display Name**: Yearly Premium Access
7. **Description**: Unlock unlimited AI chat and premium features
8. Click "Create"

### 2.5 Get Shared Secret
1. In App Store Connect, go to "Features" → "In-App Purchases"
2. Click "App-Specific Shared Secret"
3. Click "Generate"
4. **Copy this secret** - you'll add it to RevenueCat

### 2.6 Add Shared Secret to RevenueCat
1. Go back to RevenueCat dashboard
2. Go to your app settings
3. Paste the **Shared Secret** from App Store Connect
4. Click "Save"

---

## Step 3: Install RevenueCat SDK ⏸️ PENDING

### 3.1 Install Package
```bash
cd frontend-new
npx expo install react-native-purchases
```

### 3.2 Update app.config.js
Add RevenueCat API key to your config:
```javascript
export default {
  // ... existing config
  extra: {
    revenueCatApiKey: process.env.REVENUECAT_API_KEY || 'your_public_api_key_here',
  },
};
```

### 3.3 Create .env file (Optional but Recommended)
```
REVENUECAT_API_KEY=appl_YourPublicAPIKeyHere
```

---

## Step 4: Create Subscription Context ⏸️ PENDING

Create `src/contexts/SubscriptionContext.tsx` to manage subscription state across the app.

---

## Step 5: Build Paywall UI ⏸️ PENDING

Create `app/paywall.tsx` - A beautiful screen showing pricing tiers with:
- Highlighted "Best Value" badge on yearly
- Clear pricing for each tier
- Feature list
- Subscribe buttons
- Restore purchases option
- Terms & Privacy links

---

## Step 6: Implement Rate Limiting ⏸️ PENDING

Update AI Chat to:
- Track message count for free users
- Show remaining messages
- Prompt upgrade when limit reached
- Allow unlimited for premium users

---

## Step 7: Update Profile Screen ⏸️ PENDING

Show:
- Current subscription status (Free/Premium)
- Subscription type (Weekly/Monthly/Yearly)
- Renewal date
- Manage subscription button

---

## Step 8: Testing ⏸️ PENDING

### 8.1 Create Sandbox Tester
1. App Store Connect → Users and Access → Sandbox Testers
2. Create test account
3. Use this to test purchases

### 8.2 Test Purchase Flows
- Test each subscription tier
- Test cancellation
- Test restore purchases
- Test expired subscriptions

---

## Checklist

- [ ] RevenueCat account created
- [ ] App added to RevenueCat
- [ ] API keys saved
- [ ] App Store Connect app created
- [ ] Subscription group created
- [ ] 3 subscription products created
- [ ] Shared secret added to RevenueCat
- [ ] RevenueCat SDK installed
- [ ] Subscription context created
- [ ] Paywall UI built
- [ ] Rate limiting implemented
- [ ] Profile screen updated
- [ ] Sandbox testing completed

---

**Estimated Time**: 1-2 weeks total
**Current Step**: Step 1 - RevenueCat Setup

**Next Action**: Create your RevenueCat account and add your app!
