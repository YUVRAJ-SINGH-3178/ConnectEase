# LearnEase - Quick Start Guide

## 🎯 You're Almost Ready!

Your LearnEase app is now integrated with Supabase. Follow these simple steps to get started:

## Step 1: Set Up Your Database

1. **Open Supabase Dashboard**

   - Go to: https://supabase.com/dashboard/project/cpnugkulocopjickinzf
   - Click "SQL Editor" in the left sidebar

2. **Run the Schema**
   - Copy everything from `supabase/schema.sql`
   - Paste in SQL Editor
   - Click "Run"
   - Wait for "Success. No rows returned"

## Step 2: Create Test Users (Quick Method)

Instead of manually creating users, just sign up through the app! The database trigger will automatically create profiles.

### Option A: Sign Up Through the App (Easiest)

1. Start your app: `npm run dev`
2. You'll see the login page
3. Enter ANY email and password
4. Click "Login / Sign Up"
5. A new user and profile will be created automatically!

### Option B: Create Users Manually in Supabase

1. Go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Create users with these emails (password: password123):

   - alice@learnease.io
   - bob@learnease.io
   - charlie@learnease.io

4. Then run the seed data:
   - Copy content from `supabase/seed.sql`
   - Replace placeholder UUIDs with actual user IDs from Auth → Users
   - Run in SQL Editor

## Step 3: Start the App

```bash
npm run dev
```

## Step 4: Test the Features

### Try These Actions:

✅ **Sign Up / Login**

- Create a new account or use test credentials
- Profile is auto-created!

✅ **Edit Your Profile**

- Go to "My Profile"
- Click "Edit Profile"
- Add skills you can teach
- Add skills you want to learn

✅ **Find Matches**

- Go to "Find Match"
- See users who have complementary skills
- Click "Contact" to start a conversation

✅ **Chat**

- Go to "Messages"
- Send messages to other users
- Conversations are saved in real-time!

✅ **Schedule Sessions**

- Click "Schedule" on a match card
- Pick a date and time
- View upcoming sessions on Dashboard

✅ **Community Posts**

- Go to "Community"
- Create a post
- Like and comment on others' posts

✅ **Earn Coins**

- Complete sessions
- Rate your learning partners
- Watch your coins grow!

✅ **Leaderboard**

- See top users by coins earned

## 🔧 Troubleshooting

### "User not found" after signup

- The trigger should auto-create profiles
- Check Supabase logs for errors
- Verify schema.sql was run successfully

### "RLS policy violation"

- Ensure you're logged in
- Check RLS policies in Supabase dashboard
- Tables → Select table → Policies tab

### Messages not appearing

- Check browser console for errors
- Verify conversations table has data
- Try refreshing the page

### Can't find matches

- Make sure multiple users exist with different skills
- Add skills to your profile
- Skills must overlap (what you teach = what they want to learn)

## 📊 What's Integrated?

- ✅ Authentication (Supabase Auth)
- ✅ User Profiles (profiles table)
- ✅ Skill Matching (matches table)
- ✅ Real-time Chat (conversations + messages)
- ✅ Session Scheduling (sessions table)
- ✅ Community Posts (posts table)
- ✅ Gamification (ledger + badges)
- ✅ Notifications (notifications table)
- ✅ Leaderboard (sorted profiles)

## 🎨 What's Still Mock?

- AI Features (Generate Bio, Draft Intro) - These use external AI APIs
- Some UI components use placeholder images from Unsplash

## 📝 Database Structure

All data is stored in Supabase:

- `profiles` - User information and skills
- `matches` - Skill swap connections
- `sessions` - Scheduled learning sessions
- `conversations` - Chat threads
- `messages` - Individual chat messages
- `posts` - Community posts with likes/comments
- `ledger` - Coin transaction history
- `badges` - User achievements
- `notifications` - System notifications

## 🚀 Next Steps

1. **Customize** - Add more skills, modify UI, add features
2. **Test** - Create multiple users and test interactions
3. **Deploy** - Deploy to Vercel, Netlify, or your platform of choice
4. **Extend** - Add file uploads, video calls, advanced matching

## 💡 Tips

- Use Chrome DevTools to watch network requests
- Check Supabase Dashboard → Table Editor to see data
- View Supabase Logs for debugging
- Enable Realtime on tables for live updates

## 🆘 Need Help?

- Check `SUPABASE_SETUP.md` for detailed setup
- Review Supabase docs: https://supabase.com/docs
- Check browser console for errors
- Review RLS policies if you get permission errors

---

**Enjoy building with LearnEase! 🎉**
