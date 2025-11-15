import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DeckManager from "@/components/deck-manager";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export default async function DecksPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: decks } = await supabase
    .from("custom_decks")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobbies
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">My Decks</h1>
          <p className="text-muted-foreground">
            Create and manage your custom word decks
          </p>
        </div>

        <DeckManager userId={data.user.id} initialDecks={decks || []} />
      </div>
    </div>
  );
}
