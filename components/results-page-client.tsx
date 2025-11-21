"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Crown, Home, BarChart, RotateCcw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { clearLobbySession } from "@/lib/lobby-session"
import { useLanguage } from "@/lib/language-context"

interface ResultsPageClientProps {
  lobby: any
  players: any[]
  winner: any
  currentUserId: string
  handleRematch: () => Promise<void>
}

export function ResultsPageClient({ lobby, players, winner, currentUserId, handleRematch }: ResultsPageClientProps) {
  const { t } = useLanguage()

  useEffect(() => {
    clearLobbySession()
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-2">{t("results.gameOver")}</CardTitle>
            <CardDescription className="text-lg">
              {winner && (
                <>
                  <Crown className="w-5 h-5 inline text-yellow-500 mr-2" />
                  {t("results.winner")}: {winner.profiles.display_name}
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              {t("results.finalScoreboard")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players?.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? "bg-yellow-500/20 border-2 border-yellow-500 dark:bg-yellow-500/10"
                      : index === 1
                        ? "bg-muted/50 border"
                        : index === 2
                          ? "bg-orange-500/20 border dark:bg-orange-500/10"
                          : "bg-card border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow">
                      {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                      {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                      {index === 2 && <Trophy className="w-4 h-4 text-orange-600" />}
                      {index > 2 && <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={player.profiles.profile_picture || undefined} />
                      <AvatarFallback>{player.profiles.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg text-foreground">{player.profiles.display_name}</p>
                      {player.user_id === currentUserId && (
                        <span className="text-xs text-primary font-medium">{t("results.you")}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{player.score}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.score === 1 ? t("results.point") : t("results.points")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/game">
              <Home className="w-4 h-4 mr-2" />
              {t("results.backToHome")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/game/leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              {t("results.viewLeaderboard")}
            </Link>
          </Button>
          {lobby.host_id === currentUserId && (
            <form action={handleRematch}>
              <Button type="submit" variant="outline" size="lg" className="border-purple-300 bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("results.rematch")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
