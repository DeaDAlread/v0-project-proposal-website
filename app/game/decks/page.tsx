import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DeckManager from "@/components/deck-manager";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { ClientDeckPage } from '@/components/client-deck-page';

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

  return <ClientDeckPage userId={data.user.id} initialDecks={decks || []} />;
}
