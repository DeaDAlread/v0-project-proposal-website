-- Enable real-time for all game tables
alter publication supabase_realtime add table public.lobbies;
alter publication supabase_realtime add table public.lobby_players;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.profiles;

-- Grant usage on schema
grant usage on schema public to anon, authenticated;

-- Grant select on all tables for real-time
grant select on public.lobbies to anon, authenticated;
grant select on public.lobby_players to anon, authenticated;
grant select on public.chat_messages to anon, authenticated;
grant select on public.profiles to anon, authenticated;
