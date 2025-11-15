"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from 'lucide-react'

interface ReadyCheckProps {
  lobbyId: string
  userId: string
  isHost: boolean
  players: any[]
  onAllReady?: () => void
}

export function ReadyCheck({ lobbyId, userId, isHost, players, onAllReady }: ReadyCheckProps) {
  const [isReady, setIsReady] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const myPlayer = players.find(p => p.user_id === userId)
    setIsReady(myPlayer?.is_ready || false)
  }, [players, userId])

  const handleToggleReady = async () => {
    try {
      const newReadyState = !isReady

      const { error } = await supabase
        .from("lobby_players")
        .update({ is_ready: newReadyState })
        .eq("lobby_id", lobbyId)
        .eq("user_id", userId)

      if (error) throw error

      setIsReady(newReadyState)

      // Check if all players are ready
      const allReady = players.every(p => 
        p.user_id === userId ? newReadyState : p.is_ready
      )

      if (allReady && onAllReady) {
        onAllReady()
      }
    } catch (error) {
      console.error("Error toggling ready:", error)
    }
  }

  const allPlayersReady = players.length >= 2 && players.every(p => p.is_ready)
  const readyCount = players.filter(p => p.is_ready).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ready Check</h3>
        <p className="text-sm text-muted-foreground">
          {readyCount}/{players.length} Ready
        </p>
      </div>

      <Button
        onClick={handleToggleReady}
        variant={isReady ? "default" : "outline"}
        className="w-full"
      >
        {isReady ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Ready!
          </>
        ) : (
          <>
            <Circle className="mr-2 h-4 w-4" />
            Click when Ready
          </>
        )}
      </Button>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.user_id}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
          >
            {player.is_ready ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="flex-1">{player.profiles?.display_name}</span>
            {player.user_id === userId && (
              <span className="text-xs text-muted-foreground">(You)</span>
            )}
          </div>
        ))}
      </div>

      {isHost && !allPlayersReady && players.length >= 2 && (
        <p className="text-sm text-center text-yellow-600">
          Waiting for all players to be ready...
        </p>
      )}
    </div>
  )
}
