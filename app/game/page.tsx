"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from "@/lib/supabase/client";
import LobbyList from "@/components/lobby-list";
import CreateLobbyButton from "@/components/create-lobby-button";
import JoinByCode from "@/components/join-by-code";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HowToPlayDialog from "@/components/how-to-play-dialog";
import { ErrorBoundary } from "@/components/error-boundary";
import { useLanguage } from "@/lib/language-context";
import { UserDropdown } from "@/components/user-dropdown";
import { User } from 'lucide-react';

function GamePageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const supabase = createBrowserClient();
  const { t } = useLanguage();

  useEffect(() => {
    console.log("[v0] GamePage: Starting authentication check");
    
    const guestSessionStr = sessionStorage.getItem('guest_session');
    if (guestSessionStr) {
      try {
        const guestSession = JSON.parse(guestSessionStr);
        console.log("[v0] GamePage: Guest session found:", guestSession);
        setUser({ id: guestSession.id, email: guestSession.displayName, isGuest: true });
        setProfile({ display_name: guestSession.displayName });
        setIsGuest(true);
        setLoading(false);
        return;
      } catch (e) {
        console.error("[v0] GamePage: Failed to parse guest session", e);
      }
    }
    
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log("[v0] GamePage: Auth check result:", { user: user?.email, error });
      
      if (error || !user) {
        console.log("[v0] GamePage: No authenticated user, redirecting to login");
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, email, profile_picture, is_guest, total_wins")
        .eq("id", user.id)
        .single();

      console.log("[v0] GamePage: Profile fetch result:", { profile: profileData, error: profileError });

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] GamePage: Auth state changed:", event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("[v0] GamePage: User signed in, reloading data");
        setUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("[v0] GamePage: User signed out, redirecting");
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    if (isGuest) {
      sessionStorage.removeItem('guest_session');
      router.push('/auth/guest');
    } else {
      await supabase.auth.signOut();
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-from))] via-[hsl(var(--gradient-via))] to-[hsl(var(--gradient-to))]">
      {!isGuest && <HowToPlayDialog userId={user.id} />}
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('home.title')}
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              {t('home.welcome')}, {profile?.display_name || user?.email}{isGuest ? ` (${t('home.guest')})` : ""}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="default" className="hidden sm:flex">
              <Link href="/game/decks">{t('nav.myDecks')}</Link>
            </Button>
            <Button asChild variant="outline" size="default" className="hidden sm:flex">
              <Link href="/game/leaderboard">{t('nav.leaderboard')}</Link>
            </Button>
            <UserDropdown 
              userEmail={user?.email || ''} 
              displayName={profile?.display_name}
              isGuest={isGuest}
              profilePicture={profile?.profile_picture}
            />
          </div>
        </header>

        <div className="space-y-8">
          {/* Quick Actions Section */}
          <div className="grid gap-5 md:grid-cols-2">
            <CreateLobbyButton userId={user.id} isGuest={isGuest} />
            <JoinByCode userId={user.id} />
          </div>

          {/* Available Lobbies Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-5 text-foreground">
              {t('lobby.available')}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <LobbyList userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <ErrorBoundary>
      <GamePageContent />
    </ErrorBoundary>
  );
}
