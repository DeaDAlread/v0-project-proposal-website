# Setup Guide - Who Am I?

Complete setup instructions for running the game locally or deploying to production.

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

For experienced developers:

\`\`\`bash
# 1. Clone and install
git clone https://github.com/yourusername/who-am-i-game.git
cd who-am-i-game
pnpm install

# 2. Set up Supabase account and project
# 3. Create .env.local with Supabase credentials
# 4. Run database migrations
# 5. Start server
pnpm dev
\`\`\`

## Detailed Setup

### Step 1: Supabase Project

#### Create Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Fill in project details:
   - Name: `who-am-i-game`
   - Database Password: Generate strong password
   - Region: Choose closest to users
4. Wait 2-3 minutes for project creation

#### Get API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Database Setup

#### Run Migration Scripts

1. Go to **SQL Editor** in Supabase dashboard
2. Click **+ New Query**
3. Run each script from `scripts/` folder in order:

\`\`\`
001_create_tables.sql
002_create_triggers.sql
003_seed_default_data.sql
004_add_indexes.sql
005_enable_realtime.sql
006_add_timer_fields.sql
007_fix_permissions.sql
008_add_hints_field.sql
009_final_fixes.sql
010_add_guest_support.sql
011_add_message_length_constraint.sql
012_add_game_history.sql
013_add_advanced_features.sql
014_add_advanced_features_v2.sql
add_password_to_lobbies.sql
\`\`\`

**Important:** Run scripts in exact order shown above.

#### Enable Realtime

1. Go to **Database** → **Replication**
2. Enable realtime for:
   - `lobbies`
   - `lobby_players`
   - `chat_messages`
3. Click **Save**

### Step 3: Authentication Setup

#### Disable CAPTCHA (Development)

1. Go to **Authentication** → **Settings** → **Security**
2. Find **Enable CAPTCHA protection**
3. Toggle **OFF**
4. Click **Save**

#### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**` (production)
3. Click **Save**

### Step 4: Environment Variables

Create `.env.local` in project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

**Warning:** Never commit `.env.local` to version control!

### Step 5: Install and Run

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## Database Configuration

### Tables Created

Migration scripts create 6 tables:

1. **profiles** - User profiles and display names
2. **lobbies** - Game lobby state and settings
3. **lobby_players** - Players in each lobby with scores
4. **chat_messages** - Real-time chat messages
5. **custom_decks** - User-created word collections
6. **leaderboard** - Global player rankings

### Row Level Security

All tables have RLS policies:
- Users can only modify their own data
- Lobby participants can update game state
- Public data readable by all authenticated users

### Realtime Enabled

Real-time subscriptions enabled on:
- `lobbies` - State changes
- `lobby_players` - Joins/leaves
- `chat_messages` - Live chat

## Environment Variables

### Required

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service key | Settings → API (secret) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Local auth redirect | `http://localhost:3000` |

## Production Deployment

### Deploy to Vercel

#### 1. Push to GitHub

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

#### 2. Import to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository
4. Click **Import**

#### 3. Configure Environment

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.local`
3. Click **Save**

#### 4. Deploy

1. Click **Deploy**
2. Wait for build (2-3 minutes)
3. Your app is live!

#### 5. Update Supabase

Add Vercel URL to Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add `https://your-project.vercel.app/**`
3. Save

## Troubleshooting

### Common Issues

#### "Relation does not exist"

**Problem:** Database tables not created

**Solution:** Run all migration scripts in Supabase SQL Editor

---

#### Real-time not updating

**Problem:** Realtime not enabled

**Solution:**
1. Check **Database** → **Replication**
2. Enable for required tables
3. Save changes

---

#### Authentication fails

**Problem:** CAPTCHA or wrong redirect URLs

**Solution:**
1. Disable CAPTCHA in Auth settings
2. Add your domain to Redirect URLs
3. Verify environment variables

---

#### "Could not find column"

**Problem:** Missing database columns

**Solution:** Run latest migration scripts, especially `add_password_to_lobbies.sql`

---

#### Guest login broken

**Problem:** Guest support not enabled

**Solution:** Run `010_add_guest_support.sql`

---

#### Private lobbies fail

**Problem:** Missing password column

**Solution:** Run `add_password_to_lobbies.sql` migration

## Verification Checklist

After setup, test:

- [ ] Homepage loads
- [ ] Can login as guest
- [ ] Can create account
- [ ] Can create lobby
- [ ] Can join lobby
- [ ] Chat works in real-time
- [ ] Game starts and progresses
- [ ] Guessing works
- [ ] Leaderboard updates
- [ ] Custom decks work (authenticated users)
- [ ] Private lobbies work (authenticated users)
- [ ] Dark mode toggles

## Next Steps

1. **Test multiplayer** - Open multiple browser windows
2. **Create custom decks** - Add themed words
3. **Invite friends** - Share lobby links
4. **Check leaderboard** - View rankings
5. **Customize** - Modify colors and features

## Additional Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Project README:** [README.md](README.md)
- **Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

## Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review Supabase logs
- Inspect browser console

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] RLS policies active
- [ ] Realtime enabled
- [ ] Auth configured correctly
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Error monitoring setup
