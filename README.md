# 🎓 ConnectEase - University OS 

A modern web application for skill sharing and peer-to-peer learning, powered by React, TypeScript, and Supabase.

## ✨ Features

- 🔐 **Authentication** - Secure signup/login with Supabase Auth
- 👤 **User Profiles** - Customizable profiles with skills to teach and learn
- 🤝 **Smart Matching** - AI-powered algorithm to find complementary skill matches
- 💬 **Real-time Chat** - Direct messaging between matched users
- 📅 **Session Scheduling** - Schedule and manage learning sessions
- 🏆 **Gamification** - Earn coins, badges, and climb the leaderboard
- 🌐 **Community** - Share posts, like, and comment with the community
- 📊 **Dashboard** - Track your learning journey and stats

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier works great!)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo>
   cd LearnEase
   npm install
   ```

2. **Set up Supabase database**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/cpnugkulocopjickinzf)
   - Open SQL Editor
   - Copy and run `supabase/schema.sql`
   - (Optional) Run `supabase/seed.sql` for demo data

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to http://localhost:5173
   - Sign up with any email/password
   - Start exploring!

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase setup guide
- **[SUMMARY.md](./SUMMARY.md)** - Complete integration summary

## 🏗️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Zustand** - State management

### Backend

- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Row Level Security
  - Real-time subscriptions (ready)
  - Edge Functions (ready)

### External APIs

- **Google Gemini AI** - Content generation (bio, intro messages)
- **Dicebear** - Avatar generation
- **Unsplash** - Sample images

## 📁 Project Structure

```
LearnEase/
├── src/
│   ├── LearnEaseApp.tsx      # Main application
│   ├── supabaseClient.ts      # Supabase configuration
│   ├── supabaseApi.ts         # API layer
│   ├── Prism.tsx             # Background visual effects
│   ├── PixelBlast.tsx        # Particle effects
│   └── main.tsx              # Entry point
├── supabase/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Demo data
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🎮 Key Features Explained

### Matching Algorithm

The app uses a sophisticated scoring system to find the best matches:

- **Reciprocal matches** (you teach what they want to learn, and vice versa) get the highest score
- **Skill overlap** increases match quality
- **Availability** is considered for scheduling

### Gamification

- **Coins**: Earn by teaching, spend on learning
- **Badges**: Unlock achievements for milestones
- **Leaderboard**: Compete with other users

### Security

- Row Level Security (RLS) ensures users only access their own data
- Passwords are securely hashed by Supabase
- API keys are protected and should be in environment variables for production

## 🔧 Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in Netlify dashboard

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes!

## 🆘 Support & Troubleshooting

### Common Issues

**"RLS policy violation"**

- Ensure you're logged in
- Check RLS policies in Supabase dashboard

**"User not found after signup"**

- Verify the `handle_new_user()` trigger exists
- Check Supabase logs

**Data not syncing**

- Check browser console for errors
- Verify Supabase connection
- Check network tab for failed requests

### Getting Help

- Check the [QUICKSTART.md](./QUICKSTART.md) guide
- Review [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Real-time chat with WebSocket
- [ ] Video call integration
- [ ] Profile picture uploads
- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Mobile app (React Native)
- [ ] Recommendation engine
- [ ] Payment integration
- [ ] Multi-language support

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- React team for the excellent framework
- All open-source contributors

## 📬 Contact

Questions or feedback? Open an issue or reach out!

---

**Built with ❤️ using React, TypeScript, and Supabase**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
