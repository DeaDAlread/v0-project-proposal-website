-- Add constraint to limit chat message length
ALTER TABLE chat_messages 
ADD CONSTRAINT check_message_length 
CHECK (char_length(message) <= 100);

-- Add index for faster lobby queries
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_user ON lobby_players(lobby_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_lobby_created ON chat_messages(lobby_id, created_at DESC);

-- Add constraint for display name length
ALTER TABLE profiles
ADD CONSTRAINT check_display_name_length
CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 30);
