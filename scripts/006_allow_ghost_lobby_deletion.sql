-- Allow anyone to delete lobbies where the host profile no longer exists (ghost lobbies)

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "lobbies_delete_host" ON lobbies;
DROP POLICY IF EXISTS "lobbies_delete_ghost" ON lobbies;

-- Create new delete policy for lobby hosts
CREATE POLICY "lobbies_delete_host" ON lobbies
  FOR DELETE
  USING (auth.uid() = host_id);

-- Create new delete policy for ghost lobbies (where host profile doesn't exist)
CREATE POLICY "lobbies_delete_ghost" ON lobbies
  FOR DELETE
  USING (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = lobbies.host_id
    )
  );

-- Update the lobby list query to identify ghost lobbies
COMMENT ON POLICY "lobbies_delete_ghost" ON lobbies IS 
  'Allow anyone to delete lobbies where the host profile no longer exists';
