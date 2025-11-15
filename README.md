# Who Am I? - Multiplayer Party Game

A real-time multiplayer guessing game where players try to figure out their secret word by asking yes/no questions. Built with Next.js 16, React 19, and Supabase.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://v0-project-proposal-website-eight.vercel.app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Game Rules](#game-rules)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Known Bugs and Fixes](#known-bugs-and-fixes)
- [Database Migration Order](#database-migration-order)

## Features

### Core Gameplay
- **Real-time Multiplayer** - Play with friends using WebSocket connections via Supabase Realtime
- **Lobby System** - Create public or private lobbies with password protection
- **Turn-based Gameplay** - Players take turns asking questions and guessing
- **Multiple Game Modes** - Use default decks or create custom word collections
- **Live Chat** - Real-time chat during gameplay with automatic guess detection
- **Scoring System** - Track wins and compete on the global leaderboard

### User Features
- **Guest Mode** - Play instantly without creating an account
- **User Authentication** - Secure login with Supabase Auth
- **Custom Decks** - Create and manage your own word collections
- **Game History** - Review past games and performance stats
- **Leaderboard** - Compete with players globally
- **Dark Mode** - Beautiful light and dark theme support
- **Audio Effects** - Immersive sound effects for game events

### Technical Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Instant synchronization across all players
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Built with Radix UI and Tailwind CSS
- **Performance Optimized** - Fast loading and smooth interactions

## Demo

**Live Demo:** [https://v0-project-proposal-website-eight.vercel.app](https://v0-project-proposal-website-eight.vercel.app)

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library with latest features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)

### Deployment
- **Vercel** - Hosting and deployment
- **Vercel Analytics** - Performance monitoring

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** (or compatible version)
- **pnpm** (recommended) or npm/yarn
- **Git**
- **Supabase Account** (free tier works)
- **Vercel Account** (optional, for deployment)

### Step-by-Step Setup

#### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/who-am-i-game.git
cd who-am-i-game
\`\`\`

#### Step 2: Install Dependencies

\`\`\`bash
pnpm install
# or
npm install
# or
yarn install
\`\`\`

#### Step 3: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Get Your API Keys**
   - In your Supabase dashboard, go to Settings → API
   - Copy the following:
     - Project URL
     - `anon/public` key
     - `service_role` key (keep this secret!)

3. **Run Database Migrations**
   - The scripts folder contains SQL migration files
   - In Supabase dashboard, go to SQL Editor
   - Run each script in order (or they will auto-run when you connect the integration in v0)

#### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

Replace the placeholder values with your actual Supabase credentials.

#### Step 5: Enable Anonymous Authentication in Supabase

1. Go to Authentication → Settings in your Supabase dashboard
2. Under "Auth Providers" enable **Anonymous Sign-ins**
3. Save changes

This allows guest users to play without registration.

#### Step 6: Run the Development Server

\`\`\`bash
pnpm dev
# or
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Step 7: Test the Application

1. **Test Guest Login**
   - Click "Continue as Guest"
   - Create a lobby
   - Verify real-time updates work

2. **Test User Registration**
   - Click "Sign Up"
   - Create an account
   - Verify email confirmation
   - Test custom deck creation

3. **Test Multiplayer**
   - Open the app in two different browsers (or incognito mode)
   - Create a lobby in one
   - Join from the other
   - Verify real-time synchronization

#### Step 8: Deploy to Vercel (Optional)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production URL

4. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Visit your live site!

5. **Configure Supabase Redirects**
   - In Supabase dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add redirect URLs: `https://your-site.vercel.app/**`

### Quick Start (Alternative)

If you're using v0.app:

\`\`\`bash
# The integration is already set up!
# Just click "Publish" in v0 to deploy to Vercel
# All environment variables are automatically configured
\`\`\`

### Troubleshooting

**Issue: "Failed to create guest profile"**
- Ensure Anonymous Authentication is enabled in Supabase
- Check that all migration scripts have been run

**Issue: "Could not find the 'password' column"**
- Run the `001_add_password_to_lobbies.sql` script
- Refresh your database schema

**Issue: "Could not find the 'name' column of 'lobbies'"**
- Run the `008_add_lobby_name.sql` script to add the lobby name feature
- This adds custom room naming functionality

**Issue: "Could not find the 'room_code' column"**
- Run the `009_add_short_room_code.sql` script to enable short room codes
- This creates 10-character codes (e.g., "aBc123XyZ4") instead of long UUIDs
- The lobby will display a fallback code (first 8 characters) until migration is run

**Issue: Real-time updates not working**
- Verify Supabase Realtime is enabled for your tables
- Check browser console for connection errors
- Ensure RLS policies are correctly configured

**Issue: Guest lobbies appearing as "ghost lobbies"**
- Run the cleanup SQL scripts in the scripts folder
- Use the delete button on ghost lobbies

**Issue: System decks not appearing**
- Run the `010_add_system_decks.sql` script to create default decks
- Default decks include: Anime, Food, Game, and Country categories
- Each deck contains 25 themed words

**Issue: Language switching not working on some pages**
- Ensure all pages import and use the `useLanguage()` hook from `@/lib/language-context`
- Check that translation keys exist in the language dictionary
- The language preference is stored in localStorage and persists across sessions

**Issue: "Loading..." stuck on lobby code**
- This occurs when `room_code` column doesn't exist yet
- Run `009_add_short_room_code.sql` to fix
- The system falls back to showing first 8 characters of lobby ID

For more help, see [SETUP.md](SETUP.md) or open an issue on GitHub.

## Known Bugs and Fixes

### Fixed Bugs

1. **Host Ready Status Bug** - Fixed: Host can now mark themselves as ready
   - Previous issue: Host couldn't click ready button, preventing game start
   - Fix: Removed `{!isHost &&` condition from ready-check component

2. **Last Round Not Finishing** - Fixed: Game now properly ends on last round
   - Previous issue: Game stuck when last round completes
   - Fix: Added comprehensive logging and proper game ending flow for both host and non-host players

3. **Create Lobby Error** - Fixed: Removed `is_system` column dependency
   - Previous issue: Error fetching custom decks due to missing `is_system` column
   - Fix: Made code backwards compatible, removed `is_system` from initial query

4. **Translation Keys Not Found** - Fixed: Added missing translation keys
   - Previous issue: "home.title" and similar keys showing as raw text
   - Fix: Added `home.title`, `home.welcome`, `home.guest` to language dictionary

5. **Room Code Display** - Partially Fixed: Shows fallback code
   - Current state: Displays first 8 characters of UUID until migration is run
   - Full fix: Run `009_add_short_room_code.sql` for proper 10-character codes

### Active Features Requiring Migration

The following features require SQL migrations to be run:

1. **Custom Room Names** - `008_add_lobby_name.sql`
   - Adds `name` column to lobbies table
   - Allows users to name their lobbies

2. **Short Room Codes** - `009_add_short_room_code.sql`
   - Adds `room_code` column with 10-character codes
   - Includes uppercase, lowercase, and numbers
   - Auto-generates unique codes via database trigger

3. **System Decks** - `010_add_system_decks.sql`
   - Creates default public decks (Anime, Food, Game, Country)
   - Adds `is_system` column and updates RLS policies
   - Each deck contains 25 themed words

### Performance Optimizations Implemented

1. **Real-time Connection Monitoring**
   - Added connection status indicator
   - Auto-reconnect on disconnection
   - Visual feedback for users

2. **Debounced Message Sending**
   - 2-second cooldown between messages
   - Prevents spam and rate limiting issues

3. **Optimistic UI Updates**
   - Immediate local state updates
   - Real-time subscription confirms changes

4. **Lazy Player Fetching**
   - Players fetched with 100ms delay after real-time events
   - Prevents race conditions

### Internationalization (i18n)

Full Thai/English language support implemented:
- Language switcher in top right corner (TH/EN toggle)
- Translations for all pages and components
- Language preference persists in localStorage
- Covers: Login, Sign Up, Guest, Game, Lobby, Leaderboard, History, Decks, How to Play

Missing translations are automatically displayed in English as fallback.

## Database Migration Order

Run SQL scripts in this specific order:

1. `001_create_tables.sql` - Core table structure
2. `002_create_triggers.sql` - Automatic functions
3. `003_seed_default_data.sql` - Initial data
4. `004_add_indexes.sql` - Performance indexes
5. `005_enable_realtime.sql` - Real-time subscriptions
6. `006_add_timer_fields.sql` - Round timing
7. `001_add_password_to_lobbies.sql` - Private lobbies
8. `008_add_lobby_name.sql` - Custom room names
9. `009_add_short_room_code.sql` - Short join codes
10. `010_add_system_decks.sql` - Default public decks

## Game Rules

### How to Play

1. **Join a Lobby** - Create a new lobby or join an existing one
2. **Start the Game** - Each player is secretly assigned a word
3. **Take Turns** - Ask yes/no questions to figure out your word
4. **Make Guesses** - Type your guess when ready
5. **Win Points** - Correct guesses earn points
6. **Top the Leaderboard** - Player with most points wins

### Game Settings

- **Rounds:** 1-10 rounds per game
- **Round Duration:** 60-300 seconds
- **Deck Selection:** Choose from default or custom decks
- **Private Lobbies:** Require password to join (authenticated users only)

## Project Structure

\`\`\`
who-am-i-game/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   ├── game/                     # Game pages
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── game-interface.tsx        # Main game UI
│   ├── lobby-list.tsx            # Lobby browser
│   ├── lobby-room.tsx            # Pre-game lobby with chat
│   ├── create-lobby-button.tsx   # Lobby creation dialog
│   ├── deck-manager.tsx          # Custom deck CRUD operations
│   └── audio-manager.tsx         # Sound effects controller
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   └── utils.ts                  # Helper functions
├── scripts/                      # Database migrations
└── public/                       # Static assets
\`\`\`

## Architecture Overview

This project follows a modern full-stack architecture with real-time capabilities:

### Frontend Architecture

**Framework:** Next.js 16 with App Router
- Server Components for initial page loads (faster performance)
- Client Components for interactive elements
- React Server Actions for form submissions
- Streaming for progressive UI updates

**State Management:**
- React hooks (useState, useEffect) for local state
- Supabase Realtime for global state synchronization
- No Redux/Zustand needed - real-time handles most state

**Component Structure:**
\`\`\`
components/
├── ui/                          # Reusable UI primitives (buttons, cards, dialogs)
├── game-interface.tsx           # Main game logic and UI
├── lobby-list.tsx              # Browse and join lobbies
├── lobby-room.tsx              # Pre-game lobby with chat
├── create-lobby-button.tsx     # Lobby creation dialog
├── deck-manager.tsx            # Custom deck CRUD operations
└── audio-manager.tsx           # Sound effects controller
\`\`\`

**Page Structure:**
\`\`\`
app/
├── page.tsx                    # Landing page (Server Component)
├── game/
│   ├── page.tsx               # Lobby browser (Server Component)
│   ├── lobby/[id]/page.tsx    # Individual lobby room
│   ├── decks/page.tsx         # Deck management
│   ├── history/page.tsx       # Game history
│   ├── leaderboard/page.tsx   # Global rankings
│   └── profile/page.tsx       # User profile
└── auth/
    ├── login/page.tsx         # Email/password login
    ├── sign-up/page.tsx       # User registration
    └── guest/page.tsx         # Anonymous authentication
\`\`\`

### Backend Architecture

**Database:** PostgreSQL via Supabase
- 8 tables with foreign key relationships
- Row Level Security (RLS) for data protection
- Database triggers for automatic operations
- Realtime subscriptions for live updates

**Database Schema:**

\`\`\`
profiles (User accounts)
├── id (UUID, FK to auth.users)
├── display_name
├── email
├── is_guest (boolean)
└── total_wins

lobbies (Game rooms)
├── id (UUID)
├── host_id (FK to profiles)
├── status (waiting/playing/finished)
├── current_round / max_rounds
├── deck_name / deck_words
├── secret_word
├── password (for private lobbies)
└── timestamps

lobby_players (Players in lobbies)
├── id (UUID)
├── lobby_id (FK to lobbies)
├── user_id (FK to profiles)
├── score
├── is_ready
└── joined_at

chat_messages (In-game chat)
├── id (UUID)
├── lobby_id (FK to lobbies)
├── user_id (FK to profiles)
├── message
├── is_guess (boolean)
└── is_correct (boolean)

custom_decks (User-created word sets)
├── id (UUID)
├── user_id (FK to profiles)
├── name
├── words (array)
└── timestamps

leaderboard (Global rankings)
├── id (UUID)
├── user_id (FK to profiles)
├── wins
└── display_name

achievements (User achievements)
├── id (UUID)
├── user_id (FK to profiles)
├── achievement_type
├── achievement_name
└── unlocked_at

user_preferences (Settings)
├── user_id (FK to profiles)
├── sound_enabled
└── dark_mode
\`\`\`

**Security Model:**

All tables use Row Level Security (RLS):
- **SELECT policies:** Most data is publicly readable
- **INSERT policies:** Authenticated or anonymous users can create records
- **UPDATE policies:** Users can only update their own records
- **DELETE policies:** Restricted to owners or hosts

Example RLS policy:
\`\`\`sql
-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read public lobbies
CREATE POLICY "lobbies_select_all" ON lobbies
  FOR SELECT USING (true);
\`\`\`

### Real-time System

**Supabase Realtime** powers live multiplayer:

1. **Lobby Updates:**
\`\`\`typescript
// Subscribe to lobby changes
const channel = supabase
  .channel(`lobby:${lobbyId}`)
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'lobbies' },
    (payload) => {
      // Update UI with new lobby state
    }
  )
  .subscribe()
\`\`\`

2. **Player Joins/Leaves:**
\`\`\`typescript
// Track players in real-time
supabase
  .channel(`lobby_players:${lobbyId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'lobby_players' },
    (payload) => {
      // New player joined
    }
  )
\`\`\`

3. **Chat Messages:**
\`\`\`typescript
// Live chat updates
supabase
  .channel(`chat:${lobbyId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
    (payload) => {
      // Display new message
    }
  )
\`\`\`

### Authentication Flow

**Dual Authentication System:**

1. **Registered Users:**
   - Email/password via Supabase Auth
   - Email verification required
   - Full feature access
   - Persistent profile and history

2. **Guest Users:**
   - Anonymous authentication (no email/password)
   - Instant access
   - Limited to public lobbies
   - Session-based (lost on logout)

**Implementation:**

\`\`\`typescript
// Guest authentication
const { data, error } = await supabase.auth.signInAnonymously()

// User authentication  
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
\`\`\`

**Auto-Profile Creation:**

Database trigger automatically creates profile on signup:
\`\`\`sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
\`\`\`

## Implementation Steps

### Phase 1: Project Setup & Database

**Step 1.1: Initialize Next.js Project**
\`\`\`bash
npx create-next-app@latest who-am-i-game --typescript --tailwind --app
cd who-am-i-game
\`\`\`

**Step 1.2: Install Dependencies**
\`\`\`bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react sonner
\`\`\`

**Step 1.3: Create Supabase Project**
1. Sign up at supabase.com
2. Create new project
3. Save database password
4. Wait for provisioning (2-3 minutes)

**Step 1.4: Set Up Database Schema**
- Run SQL scripts in order from `scripts/` folder
- Creates tables, triggers, RLS policies, indexes
- Seeds default data (default word decks)

**Step 1.5: Enable Realtime**
- In Supabase dashboard → Database → Replication
- Enable realtime for all tables
- Configures WebSocket connections

### Phase 2: Authentication Implementation

**Step 2.1: Create Supabase Clients**

Server-side client (for Server Components):
\`\`\`typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
\`\`\`

Client-side client (for Client Components):
\`\`\`typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

**Step 2.2: Build Authentication Pages**
- Login page: `app/auth/login/page.tsx`
- Sign up page: `app/auth/sign-up/page.tsx`
- Guest auth: `app/auth/guest/page.tsx`
- Implement form validation with React Hook Form
- Handle errors with toast notifications

**Step 2.3: Enable Anonymous Auth**
- Supabase dashboard → Authentication → Settings
- Enable "Anonymous Sign-ins"
- Allows instant guest access without credentials

### Phase 3: Core Game Features

**Step 3.1: Lobby System**

Create lobby browser (`components/lobby-list.tsx`):
- Fetch lobbies with real-time subscription
- Display lobby status (waiting/playing/finished)
- Show player count
- Join/create lobby actions
- Ghost lobby detection and cleanup

**Step 3.2: Lobby Room**

Pre-game waiting room (`components/lobby-room.tsx`):
- Player list with host indicator
- Real-time player joins/leaves
- Start game button (host only)
- Leave lobby functionality
- Auto-cleanup when host leaves

**Step 3.3: Game Interface**

Main gameplay (`components/game-interface.tsx`):
- Turn-based question/answer flow
- Real-time state synchronization
- Chat with automatic guess detection
- Score tracking
- Round progression
- Winner determination
- Game history recording

**Step 3.4: Chat System**

Real-time chat (`components/lobby-chat.tsx`):
- Message input with validation
- Real-time message display
- Auto-scroll to new messages
- Guess detection keywords
- System messages for game events

### Phase 4: Advanced Features

**Step 4.1: Custom Decks**

Deck manager (`app/game/decks/page.tsx`):
- CRUD operations for custom decks
- Word validation
- Deck selection in lobby creation
- Share decks between users
- Default deck fallback

**Step 4.2: Leaderboard**

Global rankings (`app/game/leaderboard/page.tsx`):
- Sort by wins, games played, win rate
- Real-time updates
- User profile links
- Pagination for large datasets

**Step 4.3: Game History**

Past games tracker (`app/game/history/page.tsx`):
- List of completed games
- Score details
- Deck used
- Timestamp
- Replay/review functionality

**Step 4.4: Audio System**

Sound effects (`components/audio-manager.tsx`):
- Turn notification sounds
- Correct/incorrect guess feedback
- Game start/end sounds
- Volume control
- Mute toggle

### Phase 5: UI/UX Polish

**Step 5.1: Dark Mode**
- Theme provider with next-themes
- CSS variables for colors
- Gradient backgrounds that adapt
- Toggle in navigation

**Step 5.2: Responsive Design**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Collapsible sidebars
- Touch-friendly buttons

**Step 5.3: Loading States**
- Skeleton loaders
- Suspense boundaries
- Optimistic UI updates
- Error boundaries

**Step 5.4: Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast compliance (WCAG AA)

### Phase 6: Deployment

**Step 6.1: Environment Setup**
- Add all env vars to Vercel
- Configure build settings
- Set up domain (optional)

**Step 6.2: Database Configuration**
- Add production URL to Supabase redirect list
- Update CORS settings
- Verify RLS policies

**Step 6.3: Deploy**
\`\`\`bash
git push origin main
# Vercel auto-deploys from GitHub
\`\`\`

**Step 6.4: Post-Deploy Verification**
- Test authentication flow
- Create and join lobbies
- Play complete game
- Check real-time updates
- Verify mobile responsiveness

## Key Implementation Details

### Real-time Synchronization Pattern

Every interactive component follows this pattern:

1. **Initial Data Fetch** (Server Component or useEffect)
\`\`\`typescript
const { data } = await supabase
  .from('lobbies')
  .select('*')
  .eq('id', lobbyId)
  .single()
\`\`\`

2. **Subscribe to Changes** (Client Component)
\`\`\`typescript
useEffect(() => {
  const channel = supabase
    .channel(`lobby:${lobbyId}`)
    .on('postgres_changes', ...)
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}, [lobbyId])
\`\`\`

3. **Optimistic Updates** (Immediate UI feedback)
\`\`\`typescript
// Update local state immediately
setLocalState(newValue)

// Then update database
await supabase.from('table').update({ ... })

// Real-time subscription will confirm/revert
\`\`\`

### State Management Strategy

No global state library needed:
- **Server state:** Supabase Realtime
- **UI state:** React useState
- **Form state:** React Hook Form
- **URL state:** Next.js params/searchParams

### Error Handling Pattern

Consistent error handling across the app:

\`\`\`typescript
try {
  const { data, error } = await supabase.from('...').select()
  
  if (error) throw error
  
  // Success handling
} catch (error) {
  console.error('[v0] Operation failed:', error)
  toast.error('User-friendly error message')
}
\`\`\`

### Performance Optimizations

1. **Server Components:** Default for all pages
2. **Code Splitting:** Dynamic imports for large components
3. **Image Optimization:** Next.js Image component
4. **Database Indexes:** On frequently queried columns
5. **Realtime Throttling:** Debounce rapid updates
6. **Lazy Loading:** Load components on demand

## Technology Decisions

### Why Next.js?
- Server-side rendering for SEO
- App Router for modern patterns
- API routes for backend logic
- Built-in optimization
- Vercel deployment integration

### Why Supabase?
- Real-time out of the box
- Built-in authentication
- PostgreSQL database
- Row Level Security
- Free tier generous
- No backend code needed

### Why TypeScript?
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Easier refactoring
- Industry standard

### Why Tailwind CSS?
- Utility-first approach
- No context switching
- Consistent design system
- Responsive utilities
- Dark mode support
- Small bundle size

### Why shadcn/ui?
- Copy-paste components
- Full customization
- Accessible by default
- TypeScript support
- Radix UI primitives
- Not a dependency

## Development Workflow

**Daily Development:**
\`\`\`bash
# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
pnpm install

# Start dev server
pnpm dev

# Make changes...

# Commit changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel auto-deploys
\`\`\`

**Adding New Features:**
1. Create feature branch
2. Implement feature
3. Test locally
4. Create pull request
5. Review and merge
6. Auto-deploy to production

**Database Migrations:**
1. Write SQL script in `scripts/`
2. Test in local Supabase
3. Run on production database
4. Document in SETUP.md

## Contact & Support

**Developer Contact:** jakkritf88@gmail.com

For questions about:
- Setup and installation
- Bug reports
- Feature requests
- Account issues
- Privacy concerns
- Data deletion requests

Feel free to reach out via email or open an issue on GitHub.

---

**Built with v0.app** | [Continue building](https://v0.app/chat/ranN9gHdab0)

Made with ❤️ using Next.js, React, and Supabase
