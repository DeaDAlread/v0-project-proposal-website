-- Fix RLS policies to support Supabase anonymous authentication
-- This allows anonymous users to create profiles when signing in

-- Drop the old guest insert policy that's causing issues
DROP POLICY IF EXISTS "profiles_insert_guest" ON profiles;

-- Create a new policy that allows both authenticated and anonymous users to insert their own profile
-- This is triggered automatically when a new auth user is created
CREATE POLICY "profiles_insert_authenticated_or_anonymous" ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);

-- Update the lobbies insert policy to allow anonymous authenticated users
DROP POLICY IF EXISTS "lobbies_insert_authenticated" ON lobbies;

CREATE POLICY "lobbies_insert_authenticated_or_anonymous" ON lobbies
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = host_id);

-- Update lobby_players insert policy to allow anonymous authenticated users
DROP POLICY IF EXISTS "lobby_players_insert_authenticated" ON lobby_players;

CREATE POLICY "lobby_players_insert_authenticated_or_anonymous" ON lobby_players
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = user_id);

-- Update chat_messages insert policy to allow anonymous authenticated users
DROP POLICY IF EXISTS "chat_messages_insert_authenticated" ON chat_messages;

CREATE POLICY "chat_messages_insert_authenticated_or_anonymous" ON chat_messages
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create a function to auto-create profiles for new users (including anonymous)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_guest, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.email, 'guest_' || new.id || '@guest.local'),
    COALESCE(new.raw_user_meta_data->>'display_name', 'Guest_' || substring(new.id::text, 1, 8)),
    CASE WHEN new.is_anonymous THEN true ELSE false END,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.lobbies TO anon, authenticated;
GRANT ALL ON public.lobby_players TO anon, authenticated;
GRANT ALL ON public.chat_messages TO anon, authenticated;
