'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, History, LogOut, Moon, Sun, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/lib/language-context'
import { createBrowserClient } from '@/lib/supabase/client'

interface UserDropdownProps {
  userEmail: string
  displayName?: string
  isGuest: boolean
  profilePicture?: string | null
}

export function UserDropdown({ userEmail, displayName, isGuest, profilePicture }: UserDropdownProps) {
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()
  const supabase = createBrowserClient()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
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
  }, [supabase])

  const toggleDarkMode = async () => {
    const newMode = !isDark
    setIsDark(newMode)
    document.documentElement.classList.toggle("dark", newMode)

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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en')
  }

  const handleSignOut = async () => {
    if (isGuest) {
      sessionStorage.removeItem('guest_session')
      router.push('/auth/guest')
    } else {
      await supabase.auth.signOut()
      router.push('/auth/login')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profilePicture || undefined} alt={displayName || userEmail} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {(displayName || userEmail).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {!isGuest && (
          <>
            <DropdownMenuItem onClick={() => router.push('/game/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>{t('nav.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/game/history')}>
              <History className="mr-2 h-4 w-4" />
              <span>{t('nav.history')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('nav.preferences')}
        </DropdownMenuLabel>
        <div 
          className="px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm transition-colors"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleDarkMode()
          }}
          onSelect={(e: Event) => e.preventDefault()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isDark ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span className="text-sm">{isDark ? t('nav.lightMode') : t('nav.darkMode')}</span>
            </div>
            <Switch 
              checked={isDark} 
              onCheckedChange={toggleDarkMode}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div 
          className="px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm transition-colors"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleLanguage()
          }}
          onSelect={(e: Event) => e.preventDefault()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              <span className="text-sm">{language === 'en' ? 'ภาษาไทย' : 'English'}</span>
            </div>
            <Switch 
              checked={language === 'th'} 
              onCheckedChange={toggleLanguage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isGuest ? t('nav.exitGame') : t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
