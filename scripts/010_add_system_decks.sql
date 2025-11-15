-- Add is_system column to custom_decks table
ALTER TABLE custom_decks
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- Update RLS policy to allow reading system decks
DROP POLICY IF EXISTS "custom_decks_select_own" ON custom_decks;

CREATE POLICY "custom_decks_select_own_or_system" ON custom_decks
FOR SELECT
USING (
  user_id = auth.uid() OR is_system = TRUE
);

-- Insert default system decks for Anime category
INSERT INTO custom_decks (id, user_id, name, words, is_system, created_at, updated_at)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'Anime',
  ARRAY[
    'Naruto', 'Luffy', 'Goku', 'Ichigo', 'Natsu',
    'Edward Elric', 'Light Yagami', 'Eren Yeager', 'Saitama', 'Tanjiro',
    'Sailor Moon', 'Pikachu', 'Totoro', 'Spike Spiegel', 'Vash',
    'Inuyasha', 'Vegeta', 'Kakashi', 'Zoro', 'Sasuke',
    'Midoriya', 'All Might', 'Levi', 'Mikasa', 'Kirito'
  ],
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET words = EXCLUDED.words, updated_at = NOW();

-- Insert default system decks for Food category
INSERT INTO custom_decks (id, user_id, name, words, is_system, created_at, updated_at)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'Food',
  ARRAY[
    'Pizza', 'Sushi', 'Burger', 'Pasta', 'Ramen',
    'Tacos', 'Curry', 'Steak', 'Salad', 'Sandwich',
    'Ice Cream', 'Chocolate', 'Cake', 'Cookies', 'Donuts',
    'Soup', 'Fried Rice', 'Noodles', 'Dumplings', 'Spring Rolls',
    'Pad Thai', 'Pho', 'Bibimbap', 'Paella', 'Lasagna'
  ],
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET words = EXCLUDED.words, updated_at = NOW();

-- Insert default system decks for Game category
INSERT INTO custom_decks (id, user_id, name, words, is_system, created_at, updated_at)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'Game',
  ARRAY[
    'Mario', 'Link', 'Sonic', 'Pikachu', 'Pac-Man',
    'Minecraft', 'Fortnite', 'Roblox', 'Among Us', 'Fall Guys',
    'Zelda', 'Pokemon', 'Kirby', 'Donkey Kong', 'Crash',
    'Spyro', 'Master Chief', 'Kratos', 'Cloud', 'Sephiroth',
    'Tetris', 'Portal', 'Half-Life', 'Overwatch', 'League of Legends'
  ],
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET words = EXCLUDED.words, updated_at = NOW();

-- Insert default system decks for Country category
INSERT INTO custom_decks (id, user_id, name, words, is_system, created_at, updated_at)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'Country',
  ARRAY[
    'USA', 'Japan', 'China', 'France', 'Germany',
    'Italy', 'Spain', 'Brazil', 'Mexico', 'Canada',
    'Australia', 'India', 'Russia', 'Thailand', 'Korea',
    'Egypt', 'Greece', 'Turkey', 'Argentina', 'Chile',
    'Sweden', 'Norway', 'Switzerland', 'Netherlands', 'Belgium'
  ],
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET words = EXCLUDED.words, updated_at = NOW();
