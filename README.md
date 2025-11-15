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
- [Deployment](#deployment)
- [Documentation](#documentation)

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

### Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/who-am-i-game.git
cd who-am-i-game

# Install dependencies
pnpm install

# Set up environment variables (see SETUP.md)
cp .env.example .env.local

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### Full Setup Guide

For complete setup instructions including database configuration, see [SETUP.md](SETUP.md)

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
│   └── ...                       # Other components
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   └── utils.ts                  # Helper functions
├── scripts/                      # Database migrations
└── public/                       # Static assets
\`\`\`

## Key Features

### Real-time Multiplayer

Built on Supabase Realtime for instant synchronization:
- Lobby state updates
- Player joins/leaves
- Chat messages
- Turn progression
- Game state changes

### Guest Support

Play without registration:
- Instant access
- Full gameplay features
- Limited to public lobbies
- No game history saved

### Custom Decks

Authenticated users can:
- Create themed word collections
- Share decks with friends
- Use community decks
- Manage unlimited decks

### Leaderboard System

Global rankings track:
- Total wins
- Games played
- Win rate
- Recent performance

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and deployment guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project

## Environment Variables

Required variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Database Schema

6 main tables:
- **profiles** - User information
- **lobbies** - Game lobby metadata
- **lobby_players** - Players in lobbies
- **chat_messages** - Chat history
- **custom_decks** - User-created decks
- **leaderboard** - Global rankings

All tables protected with Row Level Security (RLS)

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details

## Support

- Open an issue on GitHub
- Check documentation
- Contact maintainers

## Roadmap

Future features:
- Voice chat integration
- Achievements system
- Tournaments
- Mobile app
- AI opponents
- Spectator mode

---

**Built with v0.app** | [Continue building](https://v0.app/chat/ranN9gHdab0)

Made with ❤️ using Next.js, React, and Supabase
