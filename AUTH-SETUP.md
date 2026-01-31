# Supabase Authentication Setup

## What's Been Added

1. **Auth Context** (`src/contexts/AuthContext.tsx`)
   - Manages user authentication state
   - Provides sign up, sign in, and sign out functions
   - Listens for auth state changes

2. **Login Screen** (`app/auth/login.tsx`)
   - Beautiful black & white themed login/sign up UI
   - Email/password authentication
   - Email verification flow

3. **Auth Flow** (`app/_layout.tsx`)
   - Automatically redirects to login if not authenticated
   - Redirects to app if authenticated
   - Shows loading state during auth check

4. **Settings Screen** (updated)
   - Shows user's email
   - Sign out button

## Supabase Configuration Required

### 1. Enable Email Authentication

Go to your Supabase Dashboard → Authentication → Providers

Make sure **Email** provider is enabled with these settings:
- ✅ Enable email provider
- ✅ Confirm email (recommended)
- Email templates can be customized under Authentication → Email Templates

### 2. Configure Site URL (Important!)

Go to Authentication → URL Configuration and set:

- **Site URL**: `exp://localhost:8081` (for local development)
- **Redirect URLs**: Add these:
  - `exp://localhost:8081/**`
  - `myapp://**` (replace with your custom scheme if you have one)

### 3. Email Templates (Optional)

Customize the email templates under Authentication → Email Templates:
- Confirm signup
- Reset password
- Magic link

## User Preferences Storage

The next step will be to save user preferences (like Bible version) to the `user_preferences` table you already have in Supabase.

### Enable Row Level Security (RLS)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

## Testing

1. Start the app: `cd frontend-new && npx expo start --clear`
2. You should see the login screen
3. Create a test account with your email
4. Check your email for verification link (if enabled)
5. Sign in and you'll be redirected to the app
6. Go to Settings to see your email and sign out button

## Next Steps

- [ ] Save Bible version preference to user_preferences table
- [ ] Sync bookmarks with user account
- [ ] Add password reset functionality
- [ ] Add email verification reminder
