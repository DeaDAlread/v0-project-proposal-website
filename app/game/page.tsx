"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import LobbyList from "@/components/lobby-list"
import CreateLobbyButton from "@/components/create-lobby-button"
import JoinByCode from "@/components/join-by-code"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import HowToPlayDialog from "@/components/how-to-play-dialog"
import { ErrorBoundary } from "@/components/error-boundary"
import { useLanguage } from "@/lib/language-context"
import { UserDropdown } from "@/components/user-dropdown"
import { getLobbySession, clearLobbySession } from "@/lib/lobby-session"

function GamePageContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [checkingRejoin, setCheckingRejoin] = useState(true)
  const supabase = createBrowserClient()
  const { t } = useLanguage()

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const checkRejoinableLobby = async (userId: string) => {
      if (!mounted) return

      const session = getLobbySession()
      if (!session || session.userId !== userId) {
        setCheckingRejoin(false)
        return
      }

      // Check if lobby still exists and is active
      const { data: lobby } = await supabase
        .from("lobbies")
        .select("id, status")
        .eq("id", session.lobbyId)
        .maybeSingle()

      if (!lobby) {
        clearLobbySession()
        setCheckingRejoin(false)
        return
      }

      // Check if player is still in the lobby and not kicked
      const { data: playerData } = await supabase
        .from("lobby_players")
        .select("kicked_at")
        .eq("lobby_id", session.lobbyId)
        .eq("user_id", userId)
        .maybeSingle()

      if (!playerData || playerData.kicked_at) {
        clearLobbySession()
        setCheckingRejoin(false)
        return
      }

      // All checks passed, redirect to lobby
      if (mounted) {
        router.push(`/game/lobby/${session.lobbyId}`)
      }
    }

    const initialize = async () => {
      // Check guest session first
      const guestSessionStr = sessionStorage.getItem("guest_session")
      if (guestSessionStr) {
        try {
          const guestSession = JSON.parse(guestSessionStr)
          if (mounted) {
            setUser({ id: guestSession.id, email: guestSession.displayName, isGuest: true })
            setProfile({ display_name: guestSession.displayName })
            setIsGuest(true)
            setLoading(false)
            await checkRejoinableLobby(guestSession.id)
          }
          return
        } catch (e) {
          console.error("Failed to parse guest session", e)
        }
      }

      // Check authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (!mounted) return

      setUser(user)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, email, profile_picture, is_guest, total_wins")
        .eq("id", user.id)
        .single()

      if (mounted) {
        setProfile(profileData)
        setLoading(false)
        await checkRejoinableLobby(user.id)
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" && mounted) {
          router.push("/auth/login")
        }
      })

      authSubscription = subscription
    }

    initialize()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [router, supabase, t])

  const handleSignOut = async () => {
    if (isGuest) {
      sessionStorage.removeItem("guest_session")
      router.push("/auth/guest")
    } else {
      await supabase.auth.signOut()
      router.push("/auth/login")
    }
  }

  if (loading || checkingRejoin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          {checkingRejoin && <p className="text-sm text-muted-foreground">{t("room.checkingSession")}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
      {!isGuest && <HowToPlayDialog userId={user.id} />}

      <div className="container mx-auto px-4 py-6 max-w-6xl flex flex-col items-center">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 w-full gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("home.title")}
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              {t("home.welcome")}, {profile?.display_name || user?.email}
              {isGuest ? ` (${t("home.guest")})` : ""}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="default" className="hidden sm:flex bg-transparent">
              <Link href="/game/decks">{t("nav.myDecks")}</Link>
            </Button>
            <Button asChild variant="outline" size="default" className="hidden sm:flex bg-transparent">
              <Link href="/game/leaderboard">{t("nav.leaderboard")}</Link>
            </Button>
            <UserDropdown
              userEmail={user?.email || ""}
              displayName={profile?.display_name}
              isGuest={isGuest}
              profilePicture={profile?.profile_picture}
            />
          </div>
        </header>

        <div className="space-y-8 w-full">
          {/* Quick Actions Section */}
          <div className="grid gap-5 md:grid-cols-2">
            <CreateLobbyButton userId={user.id} isGuest={isGuest} />
            <JoinByCode userId={user.id} />
          </div>

          {/* Available Lobbies Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-5 text-foreground">{t("lobby.available")}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <LobbyList userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <ErrorBoundary>
      <GamePageContent />
    </ErrorBoundary>
  )
}
