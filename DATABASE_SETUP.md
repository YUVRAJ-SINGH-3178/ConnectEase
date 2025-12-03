# Database Setup - IMPORTANT!

## ⚠️ CRITICAL: You MUST run this before the app will work!

The authentication and all features require the database to be set up in Supabase.

## Quick Setup (5 minutes)

### Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/cpnugkulocopjickinzf

### Step 2: Run the Schema

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file: `supabase/schema.sql` in VS Code
4. **Copy ALL 312 lines** from schema.sql
5. **Paste** into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)

You should see: ✅ `Success. No rows returned`

### Step 3: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should now see these 9 tables:
   - ✅ profiles
   - ✅ matches
   - ✅ sessions
   - ✅ conversations
   - ✅ messages
   - ✅ posts
   - ✅ ledger
   - ✅ badges
   - ✅ notifications

### Step 4: Test the App

1. Open: http://localhost:5175/
2. Click **"Don't have an account? Sign up"**
3. Fill in the signup form with your details
4. Click **"Create Account"**
5. You should be logged in automatically! 🎉

## Optional: Add Demo Data

If you want to test with demo users:

1. Go back to **SQL Editor**
2. Open `supabase/seed.sql`
3. Copy and paste it into SQL Editor
4. Click **Run**

This creates 9 demo users you can browse and match with.

## Troubleshooting

### "Profile not found" error after signup

- The app has automatic fallback profile creation
- Wait 1-2 seconds and try logging in again
- The profile will be created automatically

### "Auth not working"

- Make sure you ran the schema.sql file
- Check the Authentication tab in Supabase to see if users are being created
- Check the browser console for error messages

### "Invalid credentials" on login

- Make sure you're using the correct email/password
- Passwords must be at least 6 characters
- Try signing up with a new account instead

## What's Happening Under the Hood

1. **Sign Up**: Creates user in Supabase Auth + creates profile in profiles table
2. **Login**: Authenticates with Supabase Auth + fetches profile data
3. **Profile Creation**: Database trigger automatically creates profile OR app creates it manually as fallback
4. **Session Management**: Supabase handles JWT tokens and session persistence

## Your App is Now Ready! 🚀

Once the database is set up, all features will work:

- ✅ User authentication (signup/login/logout)
- ✅ Profile management
- ✅ Skill matching
- ✅ Session scheduling
- ✅ Real-time chat
- ✅ Community posts
- ✅ Coin system & badges
- ✅ Notifications

Enjoy LearnEase!
