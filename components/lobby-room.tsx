"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Users, Settings, Crown, ArrowLeft, UserX, Copy, Check, Plus, Minus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import GameInterface from "@/components/game-interface"
import { ReadyCheck } from "@/components/ready-check"
import { LobbyChat } from "@/components/lobby-chat"
import { useLanguage } from "@/lib/language-context"
import { LobbyQRCode } from "@/components/lobby-qr-code"
import { saveLobbySession, clearLobbySession } from "@/lib/lobby-session"

type Profile = {
  id: string
  display_name: string
  email: string
  profile_picture?: string // Added profile_picture field
}

type Player = {
  id: string
  user_id: string
  score: number
  profiles: Profile
  is_ready: boolean
  kicked_at?: string // Added kicked_at field
}

type Lobby = {
  id: string
  host_id: string
  status: string
  current_round: number
  max_rounds: number
  current_player_id: string | null
  secret_word: string | null
  deck_name: string
  deck_words: string[]
  chat_start_time: string
  round_start_time: string
  round_duration: number
  room_code?: string // Added room_code field
}

export default function LobbyRoom({
  lobbyId,
  userId,
  userProfile,
  initialLobby,
}: {
  lobbyId: string
  userId: string
  userProfile: any
  initialLobby: Lobby
}) {
  const [lobby, setLobby] = useState<Lobby>(initialLobby)
  const [players, setPlayers] = useState<Player[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [customDecks, setCustomDecks] = useState<any[]>([])
  const [selectedDeck, setSelectedDeck] = useState(initialLobby.deck_name)
  const [maxRounds, setMaxRounds] = useState(initialLobby.max_rounds)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [wasKicked, setWasKicked] = useState(false) // Added state to track if current user was kicked
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const isHost = lobby.host_id === userId

  const checkIfKicked = async () => {
    const { data, error } = await supabase
      .from("lobby_players")
      .select("kicked_at")
      .eq("lobby_id", lobbyId)
      .eq("user_id", userId)
      .maybeSingle()

    if (data && data.kicked_at) {
      setWasKicked(true)
    }
  }

  const fetchPlayers = async () => {
    console.log("[v0] LobbyRoom: Fetching players...")
    const { data, error } = await supabase
      .from("lobby_players")
      .select(`
        *,
        profiles(id, display_name, email, profile_picture)
      `)
      .eq("lobby_id", lobbyId)
      .is("kicked_at", null) // Only fetch players who haven't been kicked
      .order("joined_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching players:", error)
      return
    }

    console.log("[v0] LobbyRoom: Players fetched", data)
    setPlayers([...(data as Player[])])
  }

  useEffect(() => {
    saveLobbySession(lobbyId, userId)

    fetchPlayers()
    checkIfKicked() // Check if current user was kicked on mount
    if (isHost) {
      fetchCustomDecks()
    }

    const channel = supabase
      .channel(`lobby_room_${lobbyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lobbies", filter: `id=eq.${lobbyId}` },
        (payload) => {
          console.log("[v0] Lobby update received:", payload)
          if (payload.new) {
            setLobby({ ...(payload.new as Lobby) })
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobbyId}` },
        () => {
          console.log("[v0] Player joined, refetching players")
          setTimeout(() => fetchPlayers(), 100)
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobbyId}` },
        () => {
          console.log("[v0] Player left, refetching players")
          setTimeout(() => fetchPlayers(), 100)
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          console.log("[v0] Player updated, refetching players")
          if (
            payload.new &&
            "user_id" in payload.new &&
            payload.new.user_id === userId &&
            "kicked_at" in payload.new &&
            payload.new.kicked_at
          ) {
            setWasKicked(true)
          }
          setTimeout(() => fetchPlayers(), 100)
        },
      )
      .subscribe((status) => {
        console.log("[v0] Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lobbyId, isHost])

  const fetchCustomDecks = async () => {
    const { data, error } = await supabase.from("custom_decks").select("*").eq("user_id", userId)

    if (error) {
      console.error("[v0] Error fetching custom decks:", error)
      return
    }

    setCustomDecks(data || [])
  }

  const handleStartGame = async () => {
    if (!isHost) return
    if (players.length < 2) {
      alert(t("room.alertPlayers"))
      return
    }

    const allReady = players.every((p) => p.is_ready)
    if (!allReady) {
      alert(t("room.alertReady"))
      return
    }

    try {
      console.log("[v0] LobbyRoom: Starting game...")
      const randomWord = lobby.deck_words[Math.floor(Math.random() * lobby.deck_words.length)]
      const randomPlayer = players[Math.floor(Math.random() * players.length)]

      const { error } = await supabase
        .from("lobbies")
        .update({
          status: "playing",
          current_round: 1,
          current_player_id: randomPlayer.user_id,
          secret_word: randomWord,
          chat_start_time: new Date().toISOString(),
          round_start_time: new Date().toISOString(),
          round_duration: 60,
        })
        .eq("id", lobbyId)

      if (error) throw error
      console.log("[v0] LobbyRoom: Game started successfully")
      const { data: updatedLobby } = await supabase.from("lobbies").select("*").eq("id", lobbyId).single()
      if (updatedLobby) {
        setLobby(updatedLobby)
      }
    } catch (error) {
      console.error("[v0] Error starting game:", error)
      alert(t("room.alertStartGame"))
    }
  }

  const handleLeaveLobby = async () => {
    try {
      clearLobbySession()

      if (isHost) {
        await supabase.from("lobbies").delete().eq("id", lobbyId)
      } else {
        await supabase.from("lobby_players").delete().eq("lobby_id", lobbyId).eq("user_id", userId)
      }
      router.push("/game")
    } catch (error) {
      console.error("[v0] Error leaving lobby:", error)
    }
  }

  const handleUpdateSettings = async () => {
    if (!isHost) return

    try {
      let deckWords = []
      const deckName = selectedDeck

      if (selectedDeck === "Default") {
        deckWords = ["Cat", "Dog", "Pizza", "Computer", "Ocean", "Mountain", "Guitar", "Book", "Coffee", "Rainbow"]
      } else {
        const deck = customDecks.find((d) => d.name === selectedDeck)
        if (deck) {
          deckWords = deck.words
        }
      }

      if (maxRounds > deckWords.length) {
        alert(
          `${t("room.tooManyRounds") || "Cannot set more rounds than available cards"} (${deckWords.length} ${t("room.cardsAvailable") || "cards available"})`,
        )
        return
      }

      const { error } = await supabase
        .from("lobbies")
        .update({
          deck_name: deckName,
          deck_words: deckWords,
          max_rounds: maxRounds,
        })
        .eq("id", lobbyId)

      if (error) throw error

      setShowSettings(false)
    } catch (error) {
      console.error("[v0] Error updating settings:", error)
      alert(t("room.alertSettings"))
    }
  }

  const handleKickPlayer = async (playerId: string) => {
    if (!isHost) return

    try {
      console.log("[v0] Kicking player:", playerId)
      const { error } = await supabase
        .from("lobby_players")
        .update({ kicked_at: new Date().toISOString() })
        .eq("lobby_id", lobbyId)
        .eq("user_id", playerId)

      if (error) {
        console.error("[v0] Error kicking player:", error)
        throw error
      }
      console.log("[v0] Player kicked successfully")
    } catch (error) {
      console.error("[v0] Error kicking player:", error)
      alert(t("room.kickError") || "Failed to kick player")
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(lobbyId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (wasKicked) {
    clearLobbySession()

    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-2 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <UserX className="w-6 h-6" />
              {t("room.kickedTitle")}
            </CardTitle>
            <CardDescription className="text-base mt-2">{t("room.kickedMessage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/game")} className="w-full">
              {t("room.backToLobbies") || "Back to Lobbies"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (lobby.status === "playing") {
    console.log("[v0] LobbyRoom: Rendering game interface")
    return <GameInterface lobby={lobby} players={players} userId={userId} userProfile={userProfile} isHost={isHost} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-primary">{t("room.startingGame")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleLeaveLobby}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("room.leaveLobby")}
          </Button>
        </div>

        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-primary">{t("room.waiting")}</CardTitle>
                <CardDescription className="mt-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="text-xs text-muted-foreground mb-1">{t("room.lobbyCode")}</p>
                      <code className="bg-primary/10 px-2 sm:px-3 py-2 rounded-lg text-foreground font-mono text-xs sm:text-sm font-bold tracking-tight sm:tracking-wide select-all border border-primary/20 break-all block max-w-full overflow-hidden">
                        {lobbyId}
                      </code>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="h-10 sm:h-12 flex-1 sm:flex-none bg-transparent"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t("room.copied") || "Copied!"}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            {t("room.copy") || "Copy"}
                          </>
                        )}
                      </Button>
                      <LobbyQRCode lobbyId={lobbyId} />
                    </div>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{t("room.deck")}</p>
                  <p className="font-semibold">{lobby.deck_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("room.maxRounds")}</p>
                  <p className="font-semibold">{lobby.max_rounds}</p>
                </div>
                {isHost && (
                  <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t("room.settings")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("room.players")} ({players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={player.profiles.profile_picture || undefined}
                            alt={player.profiles.display_name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {player.profiles.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          {player.user_id === lobby.host_id && <Crown className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium text-foreground">{player.profiles.display_name}</span>
                          {player.user_id === userId && (
                            <span className="text-xs text-foreground/70">({t("room.you")})</span>
                          )}
                        </div>
                      </div>
                      {isHost && player.user_id !== userId && (
                        <Button variant="ghost" size="sm" onClick={() => handleKickPlayer(player.user_id)}>
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {players.length >= 2 && (
                  <div className="mt-6">
                    <ReadyCheck lobbyId={lobbyId} userId={userId} isHost={isHost} players={players} />
                  </div>
                )}

                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    className="w-full mt-6 bg-primary hover:bg-primary/90"
                    disabled={players.length < 2}
                  >
                    {players.length < 2 ? t("room.waitingMore") : t("room.startGame")}
                  </Button>
                )}

                {!isHost && <p className="text-center text-muted-foreground mt-6">{t("room.waitingHost")}</p>}
              </CardContent>
            </Card>
          </div>

          <div>
            <LobbyChat lobbyId={lobbyId} userId={userId} />
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("room.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("room.settingsDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deck">{t("room.deck")}</Label>
              <Select value={selectedDeck} onValueChange={setSelectedDeck}>
                <SelectTrigger id="deck">
                  <SelectValue placeholder={t("room.selectDeck")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">{t("room.default")}</SelectItem>
                  {customDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.name}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rounds">{t("room.maxRounds")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMaxRounds(Math.max(1, maxRounds - 1))}
                  disabled={maxRounds <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Input
                  id="rounds"
                  type="number"
                  min="1"
                  max="20"
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(Number.parseInt(e.target.value) || 5)}
                  className="text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMaxRounds(Math.min(20, maxRounds + 1))}
                  disabled={maxRounds >= 20}
                  className="h-10 w-10"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t("room.roundsRange") || "Choose between 1-20 rounds"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {t("room.cancel")}
            </Button>
            <Button onClick={handleUpdateSettings}>{t("room.saveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
