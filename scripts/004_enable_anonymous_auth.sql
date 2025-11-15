-- Enable anonymous authentication for guest users
-- This allows anonymous auth users to create profiles and join lobbies

-- Update the profiles insert policy to allow anonymous users
DROP POLICY IF EXISTS "profiles_insert_guest" ON profiles;

CREATE POLICY "profiles_insert_guest" ON profiles
  FOR INSERT
  WITH CHECK (
    -- Allow anonymous authenticated users to insert their own profile
    auth.uid() = id AND is_guest = true
  );

-- Update lobbies insert policy to allow anonymous users
DROP POLICY IF EXISTS "lobbies_insert_authenticated" ON lobbies;

CREATE POLICY "lobbies_insert_authenticated" ON lobbies
  FOR INSERT
  WITH CHECK (
    -- Allow both regular and anonymous authenticated users
    auth.uid() = host_id
  );

-- Update lobby_players insert policy to allow anonymous users
DROP POLICY IF EXISTS "lobby_players_insert_authenticated" ON lobby_players;

CREATE POLICY "lobby_players_insert_authenticated" ON lobby_players
  FOR INSERT
  WITH CHECK (
    -- Allow both regular and anonymous authenticated users
    auth.uid() = user_id
  );

-- Add policy to allow anonymous users to update their own profiles
DROP POLICY IF EXISTS "profiles_update_guest_own" ON profiles;

CREATE POLICY "profiles_update_guest_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id AND is_guest = true)
  WITH CHECK (auth.uid() = id AND is_guest = true);
