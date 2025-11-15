-- Drop the existing guest insert policy that requires auth.uid()
drop policy if exists "profiles_insert_guest" on public.profiles;

-- Create a new policy that allows anonymous users to insert guest profiles
create policy "profiles_insert_guest"
  on public.profiles for insert
  to anon, authenticated
  with check (
    -- Allow guests (no auth) to create guest profiles
    (is_guest = true and auth.uid() is null)
    or
    -- Allow authenticated users to create their own profile
    (auth.uid() = id)
  );

-- Also need to allow anonymous users to insert into lobbies
drop policy if exists "lobbies_insert_authenticated" on public.lobbies;

create policy "lobbies_insert_authenticated"
  on public.lobbies for insert
  to anon, authenticated
  with check (
    -- Allow any user (guest or authenticated) to create lobbies
    true
  );

-- Allow anonymous users to insert into lobby_players
drop policy if exists "lobby_players_insert_authenticated" on public.lobby_players;

create policy "lobby_players_insert_authenticated"
  on public.lobby_players for insert
  to anon, authenticated
  with check (
    -- Allow any user to join lobbies
    true
  );
