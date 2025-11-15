-- Fix RLS policies for better real-time updates
-- Allow any player in a lobby to advance rounds when guessing correctly

-- Drop existing restrictive policy
drop policy if exists "lobbies_update_as_host" on public.lobbies;

-- Create new policy allowing lobby players to update game state
create policy "lobbies_update_by_players"
  on public.lobbies for update
  using (
    exists (
      select 1 from public.lobby_players 
      where lobby_id = lobbies.id and user_id = auth.uid()
    )
  );

-- Add index for better query performance on player lookups
create index if not exists idx_lobby_players_lookup 
  on public.lobby_players(lobby_id, user_id);

-- Add index for chat message queries
create index if not exists idx_chat_messages_lobby_time 
  on public.chat_messages(lobby_id, created_at desc);

-- Add unique constraint to prevent duplicate joins
alter table public.lobby_players 
  drop constraint if exists unique_lobby_user;

alter table public.lobby_players 
  add constraint unique_lobby_user unique (lobby_id, user_id);
