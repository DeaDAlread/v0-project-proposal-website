-- Migration: Add password column to lobbies table for private lobby support
-- Run this script to enable private lobby functionality

ALTER TABLE lobbies 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN lobbies.password IS 'Password for private lobbies. NULL means public lobby.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lobbies' AND column_name = 'password';
