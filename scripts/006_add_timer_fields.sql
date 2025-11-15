-- Add round start time field to track when each round begins
alter table public.lobbies
  add column if not exists round_start_time timestamptz default now(),
  add column if not exists round_duration integer default 60; -- 60 seconds per round

-- Update existing lobbies to have default values
update public.lobbies
set round_start_time = now(),
    round_duration = 60
where round_start_time is null;
