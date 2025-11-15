'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import DeckManager from "./deck-manager";

export function ClientDeckPage({ userId, initialDecks }: { userId: string; initialDecks: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('decks.backToLobbies')}
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">{t('decks.title')}</h1>
          <p className="text-muted-foreground">
            {t('decks.subtitle')}
          </p>
        </div>

        <DeckManager userId={userId} initialDecks={initialDecks} />
      </div>
    </div>
  );
}
