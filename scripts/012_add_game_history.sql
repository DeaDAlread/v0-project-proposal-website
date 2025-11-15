-- Create game_history table for storing completed games
create table if not exists public.game_history (
  id uuid primary key default uuid_generate_v4(),
  lobby_id uuid not null,
  host_id uuid references public.profiles(id) on delete set null,
  winner_id uuid references public.profiles(id) on delete set null,
  winner_name text not null,
  winner_score integer not null,
  total_rounds integer not null,
  deck_name text not null,
  player_count integer not null,
  played_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.game_history enable row level security;

-- Game history policies (players can see their own games)
create policy "game_history_select_own"
  on public.game_history for select
  using (
    auth.uid() = host_id 
    or auth.uid() = winner_id
    or exists (
      select 1 from public.game_history_players
      where game_id = id and user_id = auth.uid()
    )
  );

create policy "game_history_insert_authenticated"
  on public.game_history for insert
  with check (auth.uid() = host_id);

-- Create game_history_players table for storing all players in completed games
create table if not exists public.game_history_players (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references public.game_history(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  final_score integer not null,
  placement integer not null,
  created_at timestamptz default now()
);

alter table public.game_history_players enable row level security;

-- Game history players policies
create policy "game_history_players_select_all"
  on public.game_history_players for select
  using (true);

create policy "game_history_players_insert_authenticated"
  on public.game_history_players for insert
  with check (auth.uid() in (
    select host_id from public.game_history where id = game_id
  ));

-- Add index for faster queries
create index if not exists game_history_user_id_idx on public.game_history(winner_id);
create index if not exists game_history_played_at_idx on public.game_history(played_at desc);
create index if not exists game_history_players_user_id_idx on public.game_history_players(user_id);
create index if not exists game_history_players_game_id_idx on public.game_history_players(game_id);
