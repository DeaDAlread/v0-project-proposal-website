-- Add profile_picture column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Allow users to update their own profile pictures
-- (already covered by profiles_update_own policy, but verifying)
