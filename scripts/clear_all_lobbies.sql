-- Clear all lobbies from the database
-- This will delete all existing lobbies and their associated data

-- Delete all lobby players first (due to foreign key constraints)
DELETE FROM lobby_players;

-- Delete all chat messages
DELETE FROM chat_messages WHERE lobby_id IS NOT NULL;

-- Delete all lobbies
DELETE FROM lobbies;

-- Vacuum to reclaim space
VACUUM FULL lobbies;
VACUUM FULL lobby_players;
VACUUM FULL chat_messages;

-- Show results
SELECT 'All lobbies cleared successfully!' AS message;
