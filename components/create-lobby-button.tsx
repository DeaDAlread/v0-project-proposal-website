"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';

const DEFAULT_WORDS = [
  "Einstein", "Picasso", "Shakespeare", "Cleopatra", "Napoleon",
  "Mozart", "Tesla", "Da Vinci", "Gandhi", "Beethoven",
  "Newton", "Darwin", "Aristotle", "Socrates", "Plato",
  "Homer", "Michelangelo", "Galileo", "Caesar", "Lincoln"
];

export default function CreateLobbyButton({ userId }: { userId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateLobby = async () => {
    setIsCreating(true);
    const supabase = createClient();

    try {
      const { data: lobby, error: lobbyError } = await supabase
        .from("lobbies")
        .insert({
          host_id: userId,
          status: "waiting",
          deck_name: "Default Deck",
          deck_words: DEFAULT_WORDS,
          max_rounds: 5,
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      const { error: playerError } = await supabase
        .from("lobby_players")
        .insert({
          lobby_id: lobby.id,
          user_id: userId,
          score: 0,
        });

      if (playerError) throw playerError;

      router.push(`/game/lobby/${lobby.id}`);
    } catch (error) {
      console.error("[v0] Error creating lobby:", error);
      alert("Failed to create lobby");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-purple-300 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600">
          <PlusCircle className="w-6 h-6" />
          Create New Game
        </CardTitle>
        <CardDescription>Start a new lobby and invite friends</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCreateLobby}
          disabled={isCreating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isCreating ? "Creating..." : "Create Lobby"}
        </Button>
      </CardContent>
    </Card>
  );
}
