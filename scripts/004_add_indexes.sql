-- Add indexes for frequently queried columns to improve performance

-- Index for lobby players by lobby_id (used in all player queries)
CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_id ON lobby_players(lobby_id);

-- Index for lobby players by user_id (used for checking if user is in lobby)
CREATE INDEX IF NOT EXISTS idx_lobby_players_user_id ON lobby_players(user_id);

-- Index for chat messages by lobby_id and created_at (used for fetching messages)
CREATE INDEX IF NOT EXISTS idx_chat_messages_lobby_created ON chat_messages(lobby_id, created_at DESC);

-- Index for lobbies by status (used for listing available lobbies)
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);

-- Index for lobbies by created_at (used for ordering lobby list)
CREATE INDEX IF NOT EXISTS idx_lobbies_created_at ON lobbies(created_at DESC);

-- Index for leaderboard by wins (used for leaderboard ordering)
CREATE INDEX IF NOT EXISTS idx_leaderboard_wins ON leaderboard(wins DESC);

-- Composite index for custom decks by user_id
CREATE INDEX IF NOT EXISTS idx_custom_decks_user_id ON custom_decks(user_id);
