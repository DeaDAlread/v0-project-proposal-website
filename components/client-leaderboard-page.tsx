"use client"

import { useLanguage } from "@/lib/language-context"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Award, RefreshCw } from "lucide-react"

export function ClientLeaderboardPage({
  userId,
  leaderboard: initialLeaderboard,
  userRank: initialUserRank,
}: { userId: string; leaderboard: any[]; userRank: number | undefined }) {
  const { t } = useLanguage()
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const [userRank, setUserRank] = useState(initialUserRank)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from("leaderboard").select("*").order("wins", { ascending: false }).limit(50)

      if (data) {
        setLeaderboard(data)
        const rank = data.findIndex((entry) => entry.user_id === userId)
        setUserRank(rank >= 0 ? rank : undefined)
        setLastUpdate(new Date())
      }
    }

    const getTimeUntilMidnightGMT7 = () => {
      const now = new Date()
      const gmt7Offset = 7 * 60 // GMT+7 in minutes
      const localOffset = now.getTimezoneOffset() // Local timezone offset in minutes
      const offsetDiff = gmt7Offset + localOffset // Difference between local and GMT+7

      // Get current time in GMT+7
      const nowGMT7 = new Date(now.getTime() + offsetDiff * 60 * 1000)

      // Calculate next midnight GMT+7
      const nextMidnight = new Date(nowGMT7)
      nextMidnight.setHours(24, 0, 0, 0)

      // Return milliseconds until next midnight
      return nextMidnight.getTime() - nowGMT7.getTime()
    }

    const scheduleNextUpdate = () => {
      const timeUntilMidnight = getTimeUntilMidnightGMT7()

      return setTimeout(() => {
        fetchLeaderboard()
        // Schedule the next update for the following midnight
        scheduleNextUpdate()
      }, timeUntilMidnight)
    }

    const timeoutId = scheduleNextUpdate()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [supabase, userId])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    const { data } = await supabase.from("leaderboard").select("*").order("wins", { ascending: false }).limit(50)

    if (data) {
      setLeaderboard(data)
      const rank = data.findIndex((entry) => entry.user_id === userId)
      setUserRank(rank >= 0 ? rank : undefined)
      setLastUpdate(new Date())
    }
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("leaderboard.backToLobbies")}
            </Link>
          </Button>

          <Button onClick={handleManualRefresh} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("leaderboard.refresh")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {t("leaderboard.title")}
            </CardTitle>
            <CardDescription>
              {t("leaderboard.subtitle")}
              <span className="block text-xs mt-1 text-muted-foreground">
                {t("leaderboard.lastUpdate")}: {lastUpdate.toLocaleString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      entry.user_id === userId
                        ? "bg-primary/10 border-2 border-primary"
                        : index < 3
                          ? "bg-yellow-500/10 border border-yellow-500/20 dark:bg-yellow-500/5"
                          : "bg-card border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {index === 0 && <Trophy className="w-8 h-8 text-yellow-500" />}
                        {index === 1 && <Medal className="w-7 h-7 text-gray-400" />}
                        {index === 2 && <Award className="w-6 h-6 text-orange-600" />}
                        {index > 2 && <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground">{entry.display_name}</p>
                        {entry.user_id === userId && (
                          <span className="text-xs text-primary font-medium">{t("leaderboard.you")}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{entry.wins}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.wins === 1 ? t("leaderboard.win") : t("leaderboard.wins")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("leaderboard.noEntries")}</p>
                </div>
              )}
            </div>

            {userRank !== undefined && userRank >= 0 && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <p className="text-center text-sm text-muted-foreground">
                  {t("leaderboard.yourRank")} <span className="font-bold text-primary text-lg">#{userRank + 1}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
