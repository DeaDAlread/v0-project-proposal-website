-- Fix lobby_players policy to allow users to update their own scores
drop policy if exists "lobby_players_update_in_lobby" on public.lobby_players;

-- Allow players to update their own score OR allow host to update any player
create policy "lobby_players_update_own_or_host"
  on public.lobby_players for update
  using (
    auth.uid() = user_id OR
    exists (
      select 1 from public.lobbies 
      where id = lobby_id and host_id = auth.uid()
    )
  );

-- Fix lobbies policy to allow any player in the lobby to update it (for round advancement)
drop policy if exists "lobbies_update_host" on public.lobbies;

-- Allow any player in the lobby to update lobby state (for auto-advance on correct guess)
create policy "lobbies_update_players"
  on public.lobbies for update
  using (
    exists (
      select 1 from public.lobby_players 
      where lobby_id = lobbies.id and user_id = auth.uid()
    )
  );
