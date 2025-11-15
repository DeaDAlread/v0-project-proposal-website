-- Delete all lobbies and related data
-- This will clear all existing lobbies from the database

-- First, delete all lobby players
DELETE FROM lobby_players;

-- Then, delete all chat messages
DELETE FROM chat_messages;

-- Finally, delete all lobbies
DELETE FROM lobbies;

-- Confirmation message
SELECT 'All lobbies, players, and chat messages have been deleted' as status;
