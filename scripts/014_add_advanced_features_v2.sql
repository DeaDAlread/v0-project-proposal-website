-- Add fields for new features: ready check, kick tracking, dark mode preference

-- Add ready status to lobby_players
alter table public.lobby_players
  add column if not exists is_ready boolean default false,
  add column if not exists kicked_at timestamptz;

-- Add lobby settings for pre-game chat and ready check
alter table public.lobbies
  add column if not exists require_ready_check boolean default true,
  add column if not exists pre_game_messages_enabled boolean default true;

-- Add achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_type text not null,
  achievement_name text not null,
  achievement_description text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_type)
);

-- Add user preferences table
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dark_mode boolean default false,
  sound_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.achievements enable row level security;
alter table public.user_preferences enable row level security;

-- RLS policies for achievements
create policy "achievements_select_own"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "achievements_insert_own"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- RLS policies for user_preferences
create policy "user_preferences_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_achievements_user on public.achievements(user_id);
create index if not exists idx_lobby_players_ready on public.lobby_players(lobby_id, is_ready);

-- Enable realtime
alter publication supabase_realtime add table public.achievements;
alter publication supabase_realtime add table public.user_preferences;
