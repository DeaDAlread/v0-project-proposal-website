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

interface HowToPlayDialogProps {
  userId: string
}

export default function HowToPlayDialog({ userId }: HowToPlayDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

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
          <DialogTitle className="text-3xl font-bold text-purple-600">
            How to Play "Who Am I?"
          </DialogTitle>
          <DialogDescription className="text-base">
            Welcome to the ultimate party guessing game! Here's everything you need to know.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <h3 className="font-bold text-lg mb-2 text-primary">🎯 Game Objective</h3>
            <p className="text-sm text-muted-foreground">
              Guess the secret word before time runs out! The faster you guess correctly, the more points you earn.
            </p>
          </Card>

          <Card className="p-4 border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20">
            <h3 className="font-bold text-lg mb-2 text-pink-700 dark:text-pink-400">🎮 How It Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">1.</span>
                <span>Create or join a lobby to start playing with friends</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">2.</span>
                <span>Each round, one player gets a secret word that others must guess</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">3.</span>
                <span>The player with the secret word answers questions from others</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">4.</span>
                <span>Type your guesses in the chat - if you're correct, you earn points!</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600 dark:text-pink-400">5.</span>
                <span>The game automatically moves to the next round after a correct guess</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h3 className="font-bold text-lg mb-2 text-yellow-700 dark:text-yellow-400">⏱️ Scoring System</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Points are based on how quickly you guess correctly:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <span className="font-semibold">35 points</span> - Instant guess (60s remaining)</li>
              <li>• <span className="font-semibold">20 points</span> - Medium speed (30s remaining)</li>
              <li>• <span className="font-semibold">5 points</span> - Last second (0s remaining)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Score decreases linearly as time runs out. Speed is rewarded!
            </p>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">🎨 Custom Decks</h3>
            <p className="text-sm text-muted-foreground">
              Create your own word decks from "My Decks" menu! Add themed words for personalized gameplay. 
              Each deck needs at least 5 words to be playable.
            </p>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">👥 Host Controls</h3>
            <p className="text-sm text-muted-foreground">
              As the host, you can configure game settings, select decks, adjust round counts, 
              and manually skip rounds if needed. All players can trigger round advances by guessing correctly.
            </p>
          </Card>

          <Card className="p-4 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <h3 className="font-bold text-lg mb-2 text-primary">🏆 Pro Tips</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Ask clever yes/no questions to narrow down possibilities</li>
              <li>• Watch the timer - guess quickly for maximum points!</li>
              <li>• Check the global leaderboard to see top players</li>
              <li>• Create custom decks with themes your friends will love</li>
            </ul>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
            Got it! Let's Play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
