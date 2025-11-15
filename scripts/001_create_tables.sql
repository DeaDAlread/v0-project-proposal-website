-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (user management)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  total_wins integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create custom_decks table (user's private decks)
create table if not exists public.custom_decks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  words text[] not null, -- array of words
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.custom_decks enable row level security;

-- Custom decks policies (private to user)
create policy "custom_decks_select_own"
  on public.custom_decks for select
  using (auth.uid() = user_id);

create policy "custom_decks_insert_own"
  on public.custom_decks for insert
  with check (auth.uid() = user_id);

create policy "custom_decks_update_own"
  on public.custom_decks for update
  using (auth.uid() = user_id);

create policy "custom_decks_delete_own"
  on public.custom_decks for delete
  using (auth.uid() = user_id);

-- Create lobbies table (public game rooms)
create table if not exists public.lobbies (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'waiting', -- 'waiting', 'playing', 'finished'
  current_round integer default 0,
  max_rounds integer default 5,
  current_player_id uuid references public.profiles(id),
  secret_word text,
  selected_deck_id uuid references public.custom_decks(id),
  deck_name text default 'Default Deck',
  deck_words text[],
  chat_start_time timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.lobbies enable row level security;

-- Lobbies policies (public read, host write)
create policy "lobbies_select_all"
  on public.lobbies for select
  using (true);

create policy "lobbies_insert_authenticated"
  on public.lobbies for insert
  with check (auth.uid() = host_id);

create policy "lobbies_update_host"
  on public.lobbies for update
  using (auth.uid() = host_id);

create policy "lobbies_delete_host"
  on public.lobbies for delete
  using (auth.uid() = host_id);

-- Create lobby_players table (players in a lobby)
create table if not exists public.lobby_players (
  id uuid primary key default uuid_generate_v4(),
  lobby_id uuid references public.lobbies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer default 0,
  joined_at timestamptz default now(),
  unique(lobby_id, user_id)
);

alter table public.lobby_players enable row level security;

-- Lobby players policies
create policy "lobby_players_select_all"
  on public.lobby_players for select
  using (true);

create policy "lobby_players_insert_authenticated"
  on public.lobby_players for insert
  with check (auth.uid() = user_id);

create policy "lobby_players_update_in_lobby"
  on public.lobby_players for update
  using (
    exists (
      select 1 from public.lobbies 
      where id = lobby_id and host_id = auth.uid()
    )
  );

create policy "lobby_players_delete_own"
  on public.lobby_players for delete
  using (auth.uid() = user_id);

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  lobby_id uuid references public.lobbies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_guess boolean default false,
  is_correct boolean default false,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

-- Chat messages policies
create policy "chat_messages_select_all"
  on public.chat_messages for select
  using (true);

create policy "chat_messages_insert_authenticated"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Create leaderboard table (global wins tracking)
create table if not exists public.leaderboard (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  display_name text not null,
  wins integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leaderboard enable row level security;

-- Leaderboard policies (public read, update via function)
create policy "leaderboard_select_all"
  on public.leaderboard for select
  using (true);

create policy "leaderboard_insert_authenticated"
  on public.leaderboard for insert
  with check (auth.uid() = user_id);

create policy "leaderboard_update_authenticated"
  on public.leaderboard for update
  using (auth.uid() = user_id);
