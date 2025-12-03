# LearnEase Supabase Integration Guide

## 🚀 Setup Instructions

### 1. Run Database Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/cpnugkulocopjickinzf
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy the entire contents of `supabase/schema.sql`
5. Paste and run it
6. Wait for "Success" message

This will create all the tables, indexes, RLS policies, and triggers.

### 2. Run Seed Data

1. In Supabase SQL Editor, create another new query
2. Copy the contents of `supabase/seed.sql`
3. **IMPORTANT**: Before running, you need to create test users first:

   #### Create Test Users:

   - Go to "Authentication" → "Users" in Supabase dashboard
   - Click "Add user" → "Create new user"
   - Create these users with password "password123":
     - alice@learnease.io
     - bob@learnease.io
     - charlie@learnease.io
     - david@learnease.io
     - eve@learnease.io
     - frank@learnease.io
     - grace@learnease.io
     - henry@learnease.io
     - iris@learnease.io

4. After creating users, copy their UUIDs
5. Replace the placeholder UUIDs in `seed.sql` with actual user IDs
6. Run the seed script

### 3. Test Authentication

The app is now configured to use Supabase. You can:

- **Sign in** with any of the test users you created
- **Sign up** new users (they'll automatically get a profile)
- All data is now stored in Supabase, not localStorage

### 4. Quick Start for Testing

If you want to quickly test without creating all users manually:

1. Run the schema.sql
2. Sign up through the app with a new email
3. The profile will be auto-created by the database trigger
4. You can then use the app normally

## 📁 Project Structure

```
LearnEase/
├── src/
│   ├── supabaseClient.ts      # Supabase client configuration
│   ├── supabaseApi.ts          # All API functions (auth, users, matches, etc.)
│   └── LearnEaseApp.tsx        # Main app (now uses Supabase)
└── supabase/
    ├── schema.sql              # Database schema with RLS
    └── seed.sql                # Mock data for testing
```

## 🔑 Features Integrated

### ✅ Authentication

- Email/password signup and signin
- Session management
- Automatic profile creation on signup
- Secure logout

### ✅ User Profiles

- View and edit profiles
- Skills to teach/learn
- Coins and gamification
- Avatar URLs

### ✅ Matching System

- Find potential matches based on skills
- Accept/reject matches
- Track match status

### ✅ Sessions

- Schedule learning sessions
- Rate completed sessions
- Track session history

### ✅ Real-time Chat

- Direct messaging between users
- Real-time message updates
- Conversation history

### ✅ Community Posts

- Create, like, and comment on posts
- View community feed
- Social interactions

### ✅ Gamification

- Coin system for rewards
- Transaction ledger
- Badges and achievements
- Leaderboard

### ✅ Notifications

- System notifications
- Mark as read functionality
- Notification center

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS policies:

- **Profiles**: Public read, users can only update their own
- **Matches**: Users see only their matches
- **Sessions**: Users see only their own sessions
- **Messages**: Users see only messages in their conversations
- **Posts**: Public read, users manage only their own
- **Ledger**: Users see only their own transactions
- **Badges**: Public read, system-controlled writes
- **Notifications**: Users see only their own

## 🧪 Testing

### Test Different Features:

1. **Sign up** a new user
2. **Update profile** with skills to teach/learn
3. **Find matches** based on complementary skills
4. **Send messages** to matched users
5. **Schedule sessions** with other users
6. **Create posts** in the community
7. **Earn coins** by completing sessions
8. **Check leaderboard** to see rankings

## 📊 Database Schema Overview

### Core Tables:

- `profiles` - User profiles (extends auth.users)
- `matches` - Skill swap matches between users
- `sessions` - Scheduled learning sessions
- `conversations` - Chat conversations
- `messages` - Individual messages
- `posts` - Community posts with likes/comments
- `ledger` - Coin transaction history
- `badges` - User achievements
- `notifications` - System notifications

### Key Relationships:

- All tables reference `profiles(id)` which references `auth.users(id)`
- Cascade deletes ensure data integrity
- Indexed foreign keys for performance

## 🎨 Customization

### Add More Skills:

Update profiles through the UI or directly in Supabase:

```sql
UPDATE profiles
SET skills_to_teach = ARRAY['React', 'Node.js', 'Python']
WHERE id = 'user-id';
```

### Add More Mock Users:

Use the seed.sql as a template and add more INSERT statements.

### Modify RLS Policies:

Edit policies in Supabase dashboard or via SQL.

## 🐛 Troubleshooting

### "RLS policy violation" errors:

- Ensure you're logged in
- Check that RLS policies match your use case
- Verify user IDs in foreign key relationships

### "User not found" after signup:

- Check that the `handle_new_user()` trigger is working
- Manually create profile if needed

### Real-time messages not working:

- Ensure Supabase Realtime is enabled for the `messages` table
- Check browser console for subscription errors

## 🚀 Going to Production

1. **Environment Variables**: Move credentials to .env file
2. **Email Confirmation**: Enable email confirmation in Supabase Auth
3. **Social Auth**: Add OAuth providers (Google, GitHub, etc.)
4. **Storage**: Add Supabase Storage for profile pictures
5. **Edge Functions**: Add serverless functions for complex operations
6. **Monitoring**: Set up Supabase monitoring and alerts

## 📝 Next Steps

- [ ] Add profile picture uploads via Supabase Storage
- [ ] Implement real-time notifications
- [ ] Add email notifications for matches and sessions
- [ ] Implement search with full-text search
- [ ] Add video call integration
- [ ] Build recommendation algorithm
- [ ] Add reporting and moderation features

---

**Need Help?** Check the Supabase docs: https://supabase.com/docs
