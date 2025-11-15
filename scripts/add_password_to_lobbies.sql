-- Add password column to lobbies table for private lobby functionality
ALTER TABLE lobbies 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment to the column
COMMENT ON COLUMN lobbies.password IS 'Password for private lobbies. NULL means public lobby.';
