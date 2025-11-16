"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Load preference from database
    const loadPreference = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_preferences")
        .select("dark_mode")
        .eq("user_id", user.id)
        .maybeSingle()

      const darkMode = data?.dark_mode || false
      setIsDark(darkMode)
      document.documentElement.classList.toggle("dark", darkMode)
    }

    loadPreference()
  }, [])

  const toggleDarkMode = async () => {
    const newMode = !isDark
    setIsDark(newMode)
    document.documentElement.classList.toggle("dark", newMode)

    // Save to database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          dark_mode: newMode,
        }, {
          onConflict: 'user_id'
        })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}
