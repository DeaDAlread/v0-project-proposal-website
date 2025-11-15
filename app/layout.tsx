import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AudioManager } from '@/components/audio-manager'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { LanguageProvider } from '@/lib/language-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Who Am I? - Multiplayer Party Game',
  description: 'A fun multiplayer guessing game where players try to figure out the secret word through questions and answers.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>
          <AudioManager />
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
