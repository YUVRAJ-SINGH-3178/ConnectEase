# Testing Authentication - Debug Guide

## ⚠️ CRITICAL: Did you run the database schema?

**The #1 reason auth doesn't work is the database wasn't set up!**

### Check if Database is Set Up:

1. Go to: https://supabase.com/dashboard/project/cpnugkulocopjickinzf/editor
2. Do you see these tables?
   - profiles ✓
   - matches ✓
   - sessions ✓
   - conversations ✓
   - messages ✓
   - posts ✓
   - ledger ✓
   - badges ✓
   - notifications ✓

### If NO tables exist:

**YOU MUST RUN THE SCHEMA FIRST!**

1. Open: https://supabase.com/dashboard/project/cpnugkulocopjickinzf/sql/new
2. Copy ALL 312 lines from `supabase/schema.sql`
3. Paste into SQL Editor
4. Click **RUN**

---

## Testing Signup

### Step 1: Open Browser Console

1. Open http://localhost:5175/
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### Step 2: Try Signing Up

1. Click "Don't have an account? Sign up"
2. Fill in the form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
   - **Confirm**: password123
3. Click "Create Account"

### Step 3: Check Console Output

Look for these blue/green messages:

- 🔵 Starting signup
- 🔵 Signup response
- 🔵 Fetching profile
- 🔵 Profile found (or 🟡 Profile not found, creating manually)
- 🟢 Profile created
- 🟢 Signup complete

### Step 4: Check for Errors

If you see 🔴 red error messages, read them carefully:

**Common Errors:**

1. **"relation 'profiles' does not exist"**

   - ❌ Database schema not run yet
   - ✅ Fix: Run schema.sql in Supabase dashboard

2. **"User already registered"**

   - ❌ Email already exists
   - ✅ Fix: Use a different email or delete user in Auth section

3. **"Invalid email format"**

   - ❌ Email validation failed
   - ✅ Fix: Use proper email format (user@example.com)

4. **"Password should be at least 6 characters"**

   - ❌ Password too short
   - ✅ Fix: Use at least 6 characters

5. **"Failed to fetch"** or **"Network error"**
   - ❌ Can't connect to Supabase
   - ✅ Check internet connection
   - ✅ Check if Supabase project is paused

---

## Verify in Supabase Dashboard

### Check Auth Users:

1. Go to: https://supabase.com/dashboard/project/cpnugkulocopjickinzf/auth/users
2. Do you see your new user?
3. Check the email and creation time

### Check Profiles Table:

1. Go to: https://supabase.com/dashboard/project/cpnugkulocopjickinzf/editor
2. Click on **profiles** table
3. Do you see a row with your user's ID and name?

---

## Clean Start (If needed)

### Clear Browser Data:

```javascript
// Run in browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Delete Test User (In Supabase):

1. Go to Auth → Users
2. Find your test user
3. Click the ... menu → Delete user
4. Try signing up again

---

## Still Not Working?

### Copy Console Output:

1. Right-click in console
2. "Save as..."
3. Share the output to debug

### Check Network Tab:

1. F12 → Network tab
2. Try signing up
3. Look for failed requests (red)
4. Click on them to see error details

### Common Issues:

**Issue**: Form submits but nothing happens

- Check console for errors
- Check if database exists

**Issue**: "Signup failed - no user returned"

- Supabase might require email confirmation
- Check Supabase Auth settings

**Issue**: User created but profile missing

- Trigger didn't run OR
- Manual profile creation failed
- Check console logs for details

---

## Expected Flow:

1. ✅ User fills form and clicks "Create Account"
2. ✅ Console shows: 🔵 Starting signup
3. ✅ Supabase creates user in Auth
4. ✅ Console shows: 🔵 Signup response
5. ✅ Database trigger creates profile (or app creates manually)
6. ✅ Console shows: 🟢 Profile created
7. ✅ User is logged in automatically
8. ✅ App redirects to dashboard
9. ✅ You see the main LearnEase interface

If any step fails, check the console output and error messages!
