'use client'

import { useState } from 'react'
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
import { useLanguage } from '@/lib/language-context'
import { createBrowserClient } from '@/lib/supabase/client'

interface UserDropdownProps {
  userEmail: string
  displayName?: string
  isGuest: boolean
}

export function UserDropdown({ userEmail, displayName, isGuest }: UserDropdownProps) {
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
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{displayName || userEmail}</span>
          <ChevronDown className="h-4 w-4" />
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
