"use client";

import { createClient } from "@/lib/supabase/client";
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
import { useState, useEffect } from "react";
import { useLanguage } from '@/lib/language-context';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a valid recovery token
    const checkToken = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidToken(true);
      } else {
        setError(t('auth.reset.invalidToken'));
      }
    };

    checkToken();
  }, [t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.reset.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.reset.passwordTooShort'));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken && !error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('auth.reset.checking')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">{t('auth.title')}</h1>
            <p className="text-muted-foreground">{t('auth.subtitle')}</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('auth.reset.title')}</CardTitle>
              <CardDescription>
                {t('auth.reset.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {t('auth.reset.success')}
                    </p>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {t('auth.reset.redirecting')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="password">{t('auth.reset.newPassword')}</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={!isValidToken}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">{t('auth.reset.confirmPassword')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!isValidToken}
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading || !isValidToken}>
                      {isLoading ? t('auth.reset.resetting') : t('auth.reset.button')}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 text-center text-sm">
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 text-purple-600"
                >
                  {t('auth.forgot.backToLogin')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
