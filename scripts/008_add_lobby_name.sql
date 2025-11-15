-- Add name column to lobbies table
ALTER TABLE lobbies
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add default value for existing lobbies
UPDATE lobbies
SET name = 'Game Room'
WHERE name IS NULL;
