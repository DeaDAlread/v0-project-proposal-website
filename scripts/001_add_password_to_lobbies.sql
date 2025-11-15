-- Add password column to lobbies table for private lobby support
ALTER TABLE lobbies 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN lobbies.password IS 'Password for private lobbies. NULL means public lobby.';
