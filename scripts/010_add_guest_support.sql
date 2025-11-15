-- Add is_guest flag to profiles table
alter table public.profiles add column if not exists is_guest boolean default false;

-- Update policies to allow guest user creation
create policy "profiles_insert_guest"
  on public.profiles for insert
  with check (is_guest = true or auth.uid() = id);

-- Allow guests to update their own profiles
create policy "profiles_update_guest_own"
  on public.profiles for update
  using (is_guest = true and auth.uid() = id);
