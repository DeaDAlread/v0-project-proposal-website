"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/language-context';

export default function GuestLoginPage() {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter a name (at least 2 characters)");
      return;
    }
    
    if (trimmedName.length > 30) {
      setError("Name is too long (max 30 characters)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from anonymous authentication');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: trimmedName })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error("Failed to update guest profile name:", updateError);
        // Don't throw here - profile exists, just couldn't update the name
      }

      sessionStorage.setItem('isGuest', 'true');
      sessionStorage.setItem('guestId', authData.user.id);
      sessionStorage.setItem('guestName', trimmedName);
      
      // Redirect to game
      router.push("/game");
      router.refresh();
    } catch (error: unknown) {
      console.error("Guest login error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">{t('auth.title')}</h1>
            <p className="text-muted-foreground">{t('auth.subtitle')}</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('auth.guest.title')}</CardTitle>
              <CardDescription>
                {t('auth.guest.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuestLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">{t('auth.guest.displayName')}</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder={t('auth.guest.displayNamePlaceholder')}
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      minLength={2}
                      maxLength={30}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('auth.guest.displayNameHint')}
                    </p>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.guest.loading') : t('auth.guest.button')}
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    {t('auth.guest.temporary')}
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  {t('auth.guest.saveProgress')}{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4 text-purple-600"
                  >
                    {t('auth.guest.createAccount')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-purple-600 underline underline-offset-4"
            >
              {t('auth.guest.hasAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
