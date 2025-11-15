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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useLanguage } from '@/lib/language-context';

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      router.push("/game");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    const supabase = createClient();
    setIsSendingReset(true);
    setError(null);

    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', forgotEmail.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profiles) {
        setError(t('auth.forgot.emailNotFound'));
        setIsSendingReset(false);
        return;
      }

      // Email exists, proceed with sending reset link
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setForgotSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSendingReset(false);
    }
  };

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
              <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
              <CardDescription>
                {t('auth.login.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('auth.login.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t('auth.login.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        {t('auth.login.remember')}
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-600 hover:underline underline-offset-4"
                    >
                      {t('auth.login.forgotPassword')}
                    </button>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.login.loading') : t('auth.login.button')}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  {t('auth.login.noAccount')}{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4 text-purple-600"
                  >
                    {t('auth.login.signUp')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">{t('auth.login.or')}</p>
            <Link href="/auth/guest">
              <Button variant="outline" className="w-full">
                {t('auth.login.guest')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.forgot.title')}</DialogTitle>
            <DialogDescription>{t('auth.forgot.description')}</DialogDescription>
          </DialogHeader>

          {forgotSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t('auth.forgot.success')}
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSuccess(false);
                  setForgotEmail("");
                }}
                className="w-full"
              >
                {t('auth.forgot.backToLogin')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="forgot-email">{t('auth.forgot.email')}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                    setError(null);
                  }}
                  className="flex-1"
                >
                  {t('room.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1"
                >
                  {isSendingReset ? t('auth.forgot.sending') : t('auth.forgot.button')}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
