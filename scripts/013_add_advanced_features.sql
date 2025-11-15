-- Add password field to lobbies for private lobbies
alter table public.lobbies
add column password text;

-- Add player statistics fields to profiles
alter table public.profiles
add column total_wins integer default 0,
add column total_games integer default 0,
add column total_score integer default 0,
add column fastest_guess_time integer,
add column average_score numeric(10, 2) default 0;

-- Create index for faster stats queries
create index idx_profiles_stats on public.profiles(total_wins desc, total_games desc);

-- Update profile stats trigger
create or replace function update_profile_stats()
returns trigger as $$
begin
  -- Update stats when game completes
  if NEW.status = 'finished' and OLD.status = 'playing' then
    -- Update all players' total games
    update public.profiles p
    set total_games = total_games + 1,
        total_score = total_score + lp.score,
        average_score = (total_score + lp.score)::numeric / (total_games + 1)
    from public.lobby_players lp
    where lp.lobby_id = NEW.id and lp.user_id = p.id;
    
    -- Update winner's total wins
    update public.profiles p
    set total_wins = total_wins + 1
    from public.lobby_players lp
    where lp.lobby_id = NEW.id 
      and lp.user_id = p.id
      and lp.score = (
        select max(score) from public.lobby_players where lobby_id = NEW.id
      );
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

create trigger update_profile_stats_trigger
after update on public.lobbies
for each row
execute function update_profile_stats();
