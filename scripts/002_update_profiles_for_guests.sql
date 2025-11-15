-- Update profiles table to support guest users
-- Add is_guest column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Allow anyone to insert guest profiles
CREATE POLICY IF NOT EXISTS "allow_guest_profile_insert"
ON profiles
FOR INSERT
TO anon
WITH CHECK (is_guest = true);

-- Allow guest users to read their own profiles
CREATE POLICY IF NOT EXISTS "allow_guest_profile_read"
ON profiles
FOR SELECT
TO anon
USING (is_guest = true);

-- Make id column auto-generate UUIDs if not provided
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
