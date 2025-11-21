"use client"

import type React from "react"
import { clearLobbySession } from "@/lib/lobby-session"
import { Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft } from "lucide-react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Crown, Send, Trophy, ArrowRight, RotateCcw, Clock, Lightbulb } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Profile = {
  id: string
  display_name: string
  email: string
}

type Player = {
  id: string
  user_id: string
  score: number
  profiles: Profile
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
  hints_given: string[] // Added hints tracking
}

type ChatMessage = {
  id: string
  user_id: string
  message: string
  is_guess: boolean
  is_correct: boolean
  created_at: string
  profiles: Profile
}

export default function GameInterface({
  lobby: initialLobby,
  players: initialPlayers,
  userId,
  userProfile,
  isHost,
}: {
  lobby: Lobby
  players: Player[]
  userId: string
  userProfile: any
  isHost: boolean
}) {
  const { t } = useLanguage()

  const [lobby, setLobby] = useState<Lobby>(initialLobby)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [closeGuessMessage, setCloseGuessMessage] = useState<string>("")
  const [showNonHostNext, setShowNonHostNext] = useState(false)
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null)
  const isAdvancingRef = useRef(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerExpiredAtRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const isCurrentPlayer = lobby.current_player_id === userId
  const currentPlayerName =
    players.find((p) => p.user_id === lobby.current_player_id)?.profiles.display_name || "Unknown"

  const [lastMessageTime, setLastMessageTime] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("connected")

  useEffect(() => {
    setLobby({ ...initialLobby })
    setPlayers([...initialPlayers])
  }, [initialLobby, initialPlayers])

  useEffect(() => {
    fetchMessages()
    fetchPlayers()

    const channel = supabase
      .channel(`game_${lobby.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lobbies", filter: `id=eq.${lobby.id}` },
        (payload) => {
          if (payload.new) {
            setLobby({ ...(payload.new as Lobby) })
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobby.id}` },
        () => {
          setTimeout(() => fetchPlayers(), 100)
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `lobby_id=eq.${lobby.id}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name, email")
            .eq("id", (payload.new as ChatMessage).user_id)
            .single()

          if (profile) {
            setMessages((prev) => [...prev, { ...(payload.new as ChatMessage), profiles: profile }])
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected")
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected")
          setTimeout(() => {
            setConnectionStatus("reconnecting")
          }, 2000)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [lobby.id])

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setShowNonHostNext(false)
    timerExpiredAtRef.current = null

    const updateTimer = async () => {
      if (!lobby.round_start_time || lobby.status !== "playing") return

      const startTime = new Date(lobby.round_start_time).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, lobby.round_duration - elapsed)

      setTimeRemaining(remaining)

      if (remaining === 0 && !isAdvancingRef.current) {
        if (!revealedAnswer && lobby.secret_word) {
          setRevealedAnswer(lobby.secret_word)
        }

        if (timerExpiredAtRef.current === null) {
          timerExpiredAtRef.current = Date.now()
        }

        const timeSinceExpired = Math.floor((Date.now() - timerExpiredAtRef.current) / 1000)
        if (timeSinceExpired >= 5 && !isHost) {
          setShowNonHostNext(true)
        }

        if (isHost) {
          isAdvancingRef.current = true

          try {
            const nextRound = lobby.current_round + 1

            if (nextRound > lobby.max_rounds) {
              await handleEndGame()
            } else {
              await handleNextRoundTimerExpired()
            }
          } catch (error) {
            console.error("Timer advance error:", error)
          } finally {
            setTimeout(() => {
              isAdvancingRef.current = false
            }, 2000)
          }
        }
      }
    }

    updateTimer()
    timerIntervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [
    lobby.round_start_time,
    lobby.round_duration,
    lobby.status,
    isHost,
    lobby.current_round,
    lobby.max_rounds,
    revealedAnswer,
    lobby.secret_word,
  ])

  useEffect(() => {
    setRevealedAnswer(null)
    timerExpiredAtRef.current = null
  }, [lobby.current_round])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (lobby.status === "finished") {
      console.log("[v0] Lobby status changed to finished, redirecting to results")
      clearLobbySession()
      router.push(`/game/results/${lobby.id}`)
    }
  }, [lobby.status, lobby.id, router])

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("lobby_players")
      .select(`
        *,
        profiles(id, display_name, email)
      `)
      .eq("lobby_id", lobby.id)
      .order("score", { ascending: false })

    if (data) setPlayers(data as Player[])
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles(id, display_name, email)
      `)
      .eq("lobby_id", lobby.id)
      .gte("created_at", lobby.chat_start_time)
      .order("created_at", { ascending: true })

    if (data) setMessages(data as ChatMessage[])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || isProcessing || isAdvancingRef.current) return

    const now = Date.now()
    if (now - lastMessageTime < 2000) {
      setCloseGuessMessage("⏱️ Please wait 2 seconds between messages")
      setTimeout(() => setCloseGuessMessage(""), 2000)
      return
    }

    const sanitizedMessage = messageInput.trim().slice(0, 100)

    if (isCurrentPlayer && sanitizedMessage.toLowerCase() === lobby.secret_word?.toLowerCase()) {
      setCloseGuessMessage("You cannot type the answer!")
      setTimeout(() => setCloseGuessMessage(""), 3000)
      setMessageInput("")
      return
    }

    setIsProcessing(true)
    setMessageInput("")
    setLastMessageTime(now)

    try {
      const isGuess = !isCurrentPlayer
      const isCorrect = isGuess && sanitizedMessage.toLowerCase() === lobby.secret_word?.toLowerCase()

      if (isGuess && !isCorrect && lobby.secret_word) {
        const isClose = checkCloseGuess(sanitizedMessage, lobby.secret_word)
        if (isClose) {
          setCloseGuessMessage("🔥 You're getting close! Keep trying!")
          setTimeout(() => setCloseGuessMessage(""), 4000)
        }
      }

      const { error: messageError } = await supabase.from("chat_messages").insert({
        lobby_id: lobby.id,
        user_id: userId,
        message: sanitizedMessage,
        is_guess: isGuess,
        is_correct: isCorrect,
      })

      if (messageError) throw messageError

      if (isCorrect && !isAdvancingRef.current) {
        isAdvancingRef.current = true

        const minPoints = 5
        const maxTimeBonus = 30
        const timeBonus = Math.floor((timeRemaining / lobby.round_duration) * maxTimeBonus)
        const totalPoints = minPoints + timeBonus

        const currentPlayer = players.find((p) => p.user_id === userId)
        if (currentPlayer) {
          const { error: scoreError } = await supabase
            .from("lobby_players")
            .update({ score: currentPlayer.score + totalPoints })
            .eq("lobby_id", lobby.id)
            .eq("user_id", userId)

          if (scoreError) {
            console.error("Score update error:", scoreError)
          } else {
            await fetchPlayers()
          }
        }

        setTimeout(async () => {
          const nextRound = lobby.current_round + 1

          if (nextRound > lobby.max_rounds) {
            await handleEndGame()
            isAdvancingRef.current = false
            return
          }

          const usedWords = messages.filter((m) => m.is_correct).map((m) => m.message.toLowerCase())
          usedWords.push(lobby.secret_word?.toLowerCase() || "")

          const availableWords = lobby.deck_words.filter((w) => !usedWords.includes(w.toLowerCase()))

          const randomWord =
            availableWords.length > 0
              ? availableWords[Math.floor(Math.random() * availableWords.length)]
              : lobby.deck_words[Math.floor(Math.random() * lobby.deck_words.length)]

          const currentPlayerIndex = players.findIndex((p) => p.user_id === lobby.current_player_id)
          const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
          const nextPlayer = players[nextPlayerIndex]

          const { error } = await supabase
            .from("lobbies")
            .update({
              current_round: nextRound,
              current_player_id: nextPlayer.user_id,
              secret_word: randomWord,
              chat_start_time: new Date().toISOString(),
              round_start_time: new Date().toISOString(),
              hints_given: [],
            })
            .eq("id", lobby.id)

          if (error) {
            console.error("Error advancing round:", error)
          }

          setTimeout(() => {
            isAdvancingRef.current = false
          }, 1000)
        }, 2000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      isAdvancingRef.current = false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextRound = async () => {
    if (isAdvancingRef.current) return
    if (!isHost && !showNonHostNext) return

    console.log("[v0] handleNextRound called, current round:", lobby.current_round, "max rounds:", lobby.max_rounds)

    isAdvancingRef.current = true
    setShowNonHostNext(false)
    timerExpiredAtRef.current = null

    try {
      const nextRound = lobby.current_round + 1

      if (nextRound > lobby.max_rounds) {
        console.log("[v0] Game complete, ending game")
        // Clear lobby session before ending
        clearLobbySession()
        if (isHost) {
          await handleEndGame()
        } else {
          router.push(`/game/results/${lobby.id}`)
        }
        return
      }

      const usedWords = messages.filter((m) => m.is_correct).map((m) => m.message.toLowerCase())
      usedWords.push(lobby.secret_word?.toLowerCase() || "")

      const availableWords = lobby.deck_words.filter((w) => !usedWords.includes(w.toLowerCase()))

      const randomWord =
        availableWords.length > 0
          ? availableWords[Math.floor(Math.random() * availableWords.length)]
          : lobby.deck_words[Math.floor(Math.random() * lobby.deck_words.length)]

      const currentPlayerIndex = players.findIndex((p) => p.user_id === lobby.current_player_id)
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
      const nextPlayer = players[nextPlayerIndex]

      const { error } = await supabase
        .from("lobbies")
        .update({
          current_round: nextRound,
          current_player_id: nextPlayer.user_id,
          secret_word: randomWord,
          chat_start_time: new Date().toISOString(),
          round_start_time: new Date().toISOString(),
          hints_given: [],
        })
        .eq("id", lobby.id)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error starting next round:", error)
    } finally {
      setTimeout(() => {
        isAdvancingRef.current = false
      }, 1000)
    }
  }

  const handleEndGame = async () => {
    console.log("[v0] handleEndGame called, isHost:", isHost)

    clearLobbySession()

    if (!isHost) {
      console.log("[v0] Not host, redirecting to results")
      router.push(`/game/results/${lobby.id}`)
      return
    }

    try {
      console.log("[v0] Host ending game, players:", players)

      const winner = players.reduce((prev, current) => (prev.score > current.score ? prev : current))

      console.log("[v0] Winner determined:", winner.profiles.display_name, winner.score)

      const { data: gameHistory, error: historyError } = await supabase
        .from("game_history")
        .insert({
          lobby_id: lobby.id,
          host_id: lobby.host_id,
          winner_id: winner.user_id,
          winner_name: winner.profiles.display_name,
          winner_score: winner.score,
          total_rounds: lobby.max_rounds,
          deck_name: lobby.deck_name,
          player_count: players.length,
        })
        .select()
        .single()

      if (historyError) {
        console.error("[v0] Game history error:", historyError)
        throw historyError
      }

      console.log("[v0] Game history created:", gameHistory.id)

      const playerRecords = players.map((player, index) => ({
        game_id: gameHistory.id,
        user_id: player.user_id,
        display_name: player.profiles.display_name,
        final_score: player.score,
        placement: index + 1,
      }))

      const { error: playersError } = await supabase.from("game_history_players").insert(playerRecords)

      if (playersError) {
        console.error("[v0] Player records error:", playersError)
      }

      const { data: leaderboardEntry } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("user_id", winner.user_id)
        .single()

      if (leaderboardEntry) {
        await supabase
          .from("leaderboard")
          .update({
            wins: leaderboardEntry.wins + 1,
            display_name: winner.profiles.display_name,
          })
          .eq("user_id", winner.user_id)
      } else {
        await supabase.from("leaderboard").insert({
          user_id: winner.user_id,
          display_name: winner.profiles.display_name,
          wins: 1,
        })
      }

      console.log("[v0] Updating lobby status to finished")

      const { error: lobbyError } = await supabase.from("lobbies").update({ status: "finished" }).eq("id", lobby.id)

      if (lobbyError) {
        console.error("[v0] Lobby update error:", lobbyError)
        throw lobbyError
      }

      console.log("[v0] Game ended successfully, redirecting to results")
      router.push(`/game/results/${lobby.id}`)
    } catch (error) {
      console.error("[v0] Error ending game:", error)
      router.push(`/game/results/${lobby.id}`)
    }
  }

  const handleResetGame = async () => {
    if (!isHost || isAdvancingRef.current) return
    isAdvancingRef.current = true

    try {
      const randomWord = lobby.deck_words[Math.floor(Math.random() * lobby.deck_words.length)]
      const randomPlayer = players[Math.floor(Math.random() * players.length)]

      await supabase.from("lobby_players").update({ score: 0 }).eq("lobby_id", lobby.id)

      await supabase
        .from("lobbies")
        .update({
          current_round: 1,
          current_player_id: randomPlayer.user_id,
          secret_word: randomWord,
          chat_start_time: new Date().toISOString(),
          round_start_time: new Date().toISOString(),
          hints_given: [], // Reset hints on game reset
        })
        .eq("id", lobby.id)
    } catch (error) {
      console.error("Error resetting game:", error)
    } finally {
      setTimeout(() => {
        isAdvancingRef.current = false
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeRemaining > 30) return "text-green-600"
    if (timeRemaining > 10) return "text-yellow-600"
    return "text-red-600 animate-pulse"
  }

  const checkCloseGuess = (guess: string, answer: string): boolean => {
    const g = guess.toLowerCase().trim()
    const a = answer.toLowerCase().trim()

    if (g === a) return false

    if (a.includes(g) && g.length > 2) return true
    if (g.includes(a) && a.length > 2) return true

    const distance = levenshteinDistance(g, a)
    const maxLength = Math.max(g.length, a.length)
    const similarity = 1 - distance / maxLength

    return similarity >= 0.7
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  const generateHint = () => {
    if (!lobby.secret_word || !isCurrentPlayer) return ""

    const hintsGiven = lobby.hints_given || []
    const word = lobby.secret_word

    if (hintsGiven.length === 0) {
      const display = word
        .split("")
        .map((char) => (char === " " ? " / " : "_"))
        .join(" ")
      return `💡 Hint: ${display}`
    }

    if (hintsGiven.length === 1) {
      const revealedPositions = new Set<number>()
      word.split("").forEach((char, idx) => {
        if (idx === 0 || word[idx - 1] === " ") {
          revealedPositions.add(idx)
        }
      })

      const display = word
        .split("")
        .map((char, idx) => {
          if (char === " ") return " / "
          if (revealedPositions.has(idx)) return char.toUpperCase()
          return "_"
        })
        .join(" ")

      return `💡 Hint: ${display}`
    }

    if (hintsGiven.length >= 4) {
      return "💡 Maximum hints reached!"
    }

    const revealedPositions = new Set<number>()

    word.split("").forEach((char, idx) => {
      if (idx === 0 || word[idx - 1] === " ") {
        revealedPositions.add(idx)
      }
    })

    hintsGiven.slice(2).forEach((hint) => {
      const display = hint.split("💡 Hint: ")[1] || ""
      const letters = display.split(" ").filter((c) => c !== "")
      let wordIdx = 0
      word.split("").forEach((char, idx) => {
        if (char === " ") return
        const displayChar = letters[wordIdx]
        if (displayChar && displayChar !== "_" && displayChar === char.toUpperCase()) {
          revealedPositions.add(idx)
        }
        wordIdx++
      })
    })

    const availablePositions: number[] = []
    word.split("").forEach((char, idx) => {
      if (char !== " " && !revealedPositions.has(idx)) {
        availablePositions.push(idx)
      }
    })

    if (availablePositions.length === 0) {
      return "💡 All letters revealed!"
    }

    const shuffled = [...availablePositions].sort(() => Math.random() - 0.5)
    const positionToReveal = shuffled[0]
    revealedPositions.add(positionToReveal)

    const display = word
      .split("")
      .map((char, idx) => {
        if (char === " ") return " / "
        if (revealedPositions.has(idx)) return char.toUpperCase()
        return "_"
      })
      .join(" ")

    return `💡 Hint: ${display}`
  }

  const areAllLettersRevealed = (): boolean => {
    if (!lobby.secret_word) return true
    const hintsGiven = lobby.hints_given || []
    return hintsGiven.length >= 4 // Max 4 hints: underscores, first letters, then 2 more letters
  }

  const handleGiveHint = async () => {
    if (!isCurrentPlayer || isProcessing) return

    setIsProcessing(true)

    try {
      const hint = generateHint()
      const hintsGiven = lobby.hints_given || []

      const updatedHints = [...hintsGiven, hint]

      const { error } = await supabase.from("lobbies").update({ hints_given: updatedHints }).eq("id", lobby.id)

      if (error) throw error
    } catch (error) {
      console.error("Error giving hint:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextRoundTimerExpired = async () => {
    if (isAdvancingRef.current) return

    console.log("[v0] Timer expired, current round:", lobby.current_round, "max rounds:", lobby.max_rounds)

    try {
      const nextRound = lobby.current_round + 1

      if (nextRound > lobby.max_rounds) {
        console.log("[v0] Last round complete via timer, ending game")
        await handleEndGame()
        return
      }

      const usedWords = messages.filter((m) => m.is_correct).map((m) => m.message.toLowerCase())
      usedWords.push(lobby.secret_word?.toLowerCase() || "")

      const availableWords = lobby.deck_words.filter((w) => !usedWords.includes(w.toLowerCase()))

      const randomWord =
        availableWords.length > 0
          ? availableWords[Math.floor(Math.random() * availableWords.length)]
          : lobby.deck_words[Math.floor(Math.random() * lobby.deck_words.length)]

      const currentPlayerIndex = players.findIndex((p) => p.user_id === lobby.current_player_id)
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
      const nextPlayer = players[nextPlayerIndex]

      const { error } = await supabase
        .from("lobbies")
        .update({
          current_round: nextRound,
          current_player_id: nextPlayer.user_id,
          secret_word: randomWord,
          chat_start_time: new Date().toISOString(),
          round_start_time: new Date().toISOString(),
          hints_given: [],
        })
        .eq("id", lobby.id)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("[v0] Error in handleNextRoundTimerExpired:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      {connectionStatus !== "connected" && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg ${
              connectionStatus === "disconnected" ? "bg-red-500 text-white" : "bg-yellow-500 text-white animate-pulse"
            }`}
          >
            {connectionStatus === "disconnected" ? "🔴 Disconnected" : "🔄 Reconnecting..."}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Card className="shadow-lg">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button onClick={() => router.push("/game")} variant="ghost" size="sm" className="self-start">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("lobby.leaveLobby")}
                </Button>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 text-xl sm:text-2xl font-bold ${getTimerColor()}`}>
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    {formatTime(timeRemaining)}
                  </div>
                  {revealedAnswer && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg animate-pulse">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {t("game.timeUpAnswer")}:
                      </span>
                      <span className="text-lg font-bold text-red-900 dark:text-red-100">{revealedAnswer}</span>
                    </div>
                  )}
                  {isHost && lobby.current_round < lobby.max_rounds && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handleNextRound}
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Next Round
                      </Button>
                      <Button
                        onClick={handleResetGame}
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                  {isHost && lobby.current_round === lobby.max_rounds && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handleEndGame}
                        size="sm"
                        variant="default"
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {t("game.endGame")}
                      </Button>
                      <Button
                        onClick={handleResetGame}
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  )}
                  {!isHost && showNonHostNext && lobby.current_round < lobby.max_rounds && (
                    <Button
                      onClick={handleNextRound}
                      size="sm"
                      variant="default"
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 animate-pulse"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Next Round
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl sm:text-2xl text-primary">
                    Round {lobby.current_round} of {lobby.max_rounds}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className={`flex items-center gap-2 text-xl sm:text-2xl font-bold ${getTimerColor()}`}>
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                      {formatTime(timeRemaining)}
                    </div>
                    {revealedAnswer && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg animate-pulse">
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          {t("game.timeUpAnswer")}:
                        </span>
                        <span className="text-lg font-bold text-red-900 dark:text-red-100">{revealedAnswer}</span>
                      </div>
                    )}
                    {isHost && lobby.current_round < lobby.max_rounds && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={handleNextRound}
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none bg-transparent"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Next Round
                        </Button>
                        <Button
                          onClick={handleResetGame}
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none bg-transparent"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    )}
                    {isHost && lobby.current_round === lobby.max_rounds && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={handleEndGame}
                          size="sm"
                          variant="default"
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {t("game.endGame")}
                        </Button>
                        <Button
                          onClick={handleResetGame}
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none bg-transparent"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    )}
                    {!isHost && showNonHostNext && lobby.current_round < lobby.max_rounds && (
                      <Button
                        onClick={handleNextRound}
                        size="sm"
                        variant="default"
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 animate-pulse"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Next Round
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-primary/10 to-pink-500/10 dark:from-primary/5 dark:to-pink-500/5 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Current Player</p>
                  <p className="text-2xl font-bold text-foreground">{currentPlayerName}</p>
                  {isCurrentPlayer && (
                    <div className="mt-4 p-4 bg-card rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">Your Secret Word</p>
                      <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{lobby.secret_word}</p>
                      <p className="text-xs text-muted-foreground mt-2">Answer questions about this word!</p>
                      <p className="text-xs text-destructive font-semibold mt-1">
                        ⚠️ You cannot type this word in the chat!
                      </p>
                      <Button
                        onClick={handleGiveHint}
                        disabled={isProcessing || areAllLettersRevealed()}
                        className="mt-3 bg-transparent"
                        variant="outline"
                        size="sm"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {areAllLettersRevealed()
                          ? "All letters revealed!"
                          : `Give Hint (${(lobby.hints_given || []).length} given)`}
                      </Button>
                    </div>
                  )}
                  {!isCurrentPlayer && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Try to guess who they are!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Faster guesses earn more points! (5-35 points based on speed)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat & Guesses</CardTitle>
              </CardHeader>
              <CardContent>
                {closeGuessMessage && (
                  <div className="mb-4 p-3 bg-orange-100 border-2 border-orange-400 rounded-lg animate-pulse">
                    <p className="text-center font-semibold text-orange-700">{closeGuessMessage}</p>
                  </div>
                )}

                {lobby.hints_given && lobby.hints_given.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Hints Given This Round</h3>
                    </div>
                    <div className="space-y-2">
                      {lobby.hints_given.map((hint, index) => (
                        <div key={index} className="p-2 bg-card rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {messages
                      .filter((msg) => !msg.message.startsWith("💡"))
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.is_correct
                              ? "bg-green-100 border-2 border-green-500 dark:bg-green-900/20 dark:border-green-700"
                              : msg.is_guess
                                ? "bg-yellow-50 dark:bg-yellow-900/10"
                                : "bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-primary">
                                {msg.profiles.display_name}
                                {msg.user_id === userId && (
                                  <span className="text-xs text-muted-foreground ml-1">(You)</span>
                                )}
                              </p>
                              <p className="text-sm mt-1">{msg.message}</p>
                            </div>
                            {msg.is_correct && <Trophy className="w-5 h-5 text-green-600 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isCurrentPlayer
                        ? "Answer questions from other players... (Cannot type the answer!)"
                        : "Ask a question or make a guess..."
                    }
                    disabled={isProcessing}
                  />
                  <Button type="submit" disabled={isProcessing || !messageInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scoreboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.user_id === lobby.current_player_id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {player.user_id === lobby.host_id && <Crown className="w-4 h-4 text-purple-500" />}
                        <div>
                          <p className="font-medium text-sm text-foreground">{player.profiles.display_name}</p>
                          {player.user_id === userId && <span className="text-xs text-muted-foreground">You</span>}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary">{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Game Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deck:</span>
                  <span className="font-medium">{lobby.deck_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Round Time:</span>
                  <span className="font-medium">{lobby.round_duration}s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
