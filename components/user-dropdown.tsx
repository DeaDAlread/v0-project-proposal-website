'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, History, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const { t } = useLanguage()
  const supabase = createBrowserClient()

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
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isGuest ? t('nav.exitGame') : t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
