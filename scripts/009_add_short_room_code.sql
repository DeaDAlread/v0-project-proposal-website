-- Add a short room code column to lobbies table
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS room_code VARCHAR(6) UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lobbies_room_code ON lobbies(room_code);

-- Function to generate a unique 6-character room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar looking characters
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM lobbies WHERE room_code = result) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate room code when lobby is created
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_code IS NULL THEN
    NEW.room_code := generate_room_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_room_code ON lobbies;
CREATE TRIGGER trigger_set_room_code
  BEFORE INSERT ON lobbies
  FOR EACH ROW
  EXECUTE FUNCTION set_room_code();

-- Backfill existing lobbies with room codes
UPDATE lobbies 
SET room_code = generate_room_code()
WHERE room_code IS NULL;
