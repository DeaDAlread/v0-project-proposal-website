-- Add hints_given field to track what hints have been revealed
alter table public.lobbies add column if not exists hints_given text[] default '{}';

-- Add comment
comment on column public.lobbies.hints_given is 'Array tracking which hints have been given in current round';
