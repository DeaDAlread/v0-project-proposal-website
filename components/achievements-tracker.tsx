"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Trophy, Zap, Target, Crown, Star } from 'lucide-react'

interface Achievement {
  type: string
  name: string
  description: string
  icon: any
  unlocked: boolean
}

export function AchievementsTracker({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const supabase = createBrowserClient()

  const allAchievements = [
    { type: "first_win", name: "First Victory", description: "Win your first game", icon: Trophy },
    { type: "speed_demon", name: "Speed Demon", description: "Guess correctly in under 10 seconds", icon: Zap },
    { type: "five_streak", name: "On Fire", description: "Win 5 games in a row", icon: Target },
    { type: "ten_wins", name: "Champion", description: "Win 10 games total", icon: Crown },
    { type: "perfect_round", name: "Perfect Round", description: "Score 35 points in a single round", icon: Star },
  ]

  useEffect(() => {
    checkAchievements()
  }, [userId])

  const checkAchievements = async () => {
    const { data: unlockedData } = await supabase
      .from("achievements")
      .select("achievement_type")
      .eq("user_id", userId)

    const unlocked = new Set(unlockedData?.map(a => a.achievement_type) || [])

    setAchievements(
      allAchievements.map(a => ({
        ...a,
        unlocked: unlocked.has(a.type),
      }))
    )
  }

  const unlockAchievement = async (type: string) => {
    const achievement = allAchievements.find(a => a.type === type)
    if (!achievement) return

    await supabase.from("achievements").insert({
      user_id: userId,
      achievement_type: type,
      achievement_name: achievement.name,
      achievement_description: achievement.description,
    })

    checkAchievements()
  }

  // Expose function to parent components
  useEffect(() => {
    ;(window as any).unlockAchievement = unlockAchievement
  }, [])

  return null // This is a tracker component, no UI needed
}
