'use client';

const LOBBY_SESSION_KEY = 'current_lobby_session';

export interface LobbySession {
  lobbyId: string;
  userId: string;
  joinedAt: string;
}

export function saveLobbySession(lobbyId: string, userId: string) {
  const session: LobbySession = {
    lobbyId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOBBY_SESSION_KEY, JSON.stringify(session));
  }
}

export function getLobbySession(): LobbySession | null {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem(LOBBY_SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr) as LobbySession;
  } catch {
    return null;
  }
}

export function clearLobbySession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOBBY_SESSION_KEY);
  }
}
