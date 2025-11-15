"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface HowToPlayDialogProps {
  userId: string
}

export default function HowToPlayDialog({ userId }: HowToPlayDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`)
    if (!hasSeenTutorial) {
      setIsOpen(true)
    }
  }, [userId])

  const handleClose = () => {
    localStorage.setItem(`tutorial_seen_${userId}`, 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">
            {t('howToPlay.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('howToPlay.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <h3 className="font-bold text-lg mb-2 text-primary">{t('howToPlay.objective.title')}</h3>
            <p className="text-sm text-foreground">
              {t('howToPlay.objective.text')}
            </p>
          </Card>

          <Card className="p-4 border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20">
            <h3 className="font-bold text-lg mb-2 text-pink-700 dark:text-pink-400">{t('howToPlay.howItWorks.title')}</h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">1.</span>
                <span>{t('howToPlay.step1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">2.</span>
                <span>{t('howToPlay.step2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">3.</span>
                <span>{t('howToPlay.step3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">4.</span>
                <span>{t('howToPlay.step4')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">5.</span>
                <span>{t('howToPlay.step5')}</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h3 className="font-bold text-lg mb-2 text-yellow-700 dark:text-yellow-400">{t('howToPlay.scoring.title')}</h3>
            <p className="text-sm text-foreground mb-2">
              {t('howToPlay.scoring.text')}
            </p>
            <ul className="space-y-1 text-sm text-foreground">
              <li>• <span className="font-semibold">35 {t('lobby.players')}</span> - {t('howToPlay.scoring.instant')}</li>
              <li>• <span className="font-semibold">20 {t('lobby.players')}</span> - {t('howToPlay.scoring.medium')}</li>
              <li>• <span className="font-semibold">5 {t('lobby.players')}</span> - {t('howToPlay.scoring.last')}</li>
            </ul>
            <p className="text-sm text-foreground mt-2">
              {t('howToPlay.scoring.note')}
            </p>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">{t('howToPlay.customDecks.title')}</h3>
            <p className="text-sm text-foreground">
              {t('howToPlay.customDecks.text')}
            </p>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">{t('howToPlay.hostControls.title')}</h3>
            <p className="text-sm text-foreground">
              {t('howToPlay.hostControls.text')}
            </p>
          </Card>

          <Card className="p-4 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <h3 className="font-bold text-lg mb-2 text-primary">{t('howToPlay.proTips.title')}</h3>
            <ul className="space-y-1 text-sm text-foreground">
              <li>• {t('howToPlay.tip1')}</li>
              <li>• {t('howToPlay.tip2')}</li>
              <li>• {t('howToPlay.tip3')}</li>
              <li>• {t('howToPlay.tip4')}</li>
            </ul>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
            {t('howToPlay.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
