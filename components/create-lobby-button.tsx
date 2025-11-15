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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Lock } from 'lucide-react';

const DEFAULT_WORDS = [
  "Einstein", "Picasso", "Shakespeare", "Cleopatra", "Napoleon",
  "Mozart", "Tesla", "Da Vinci", "Gandhi", "Beethoven",
  "Newton", "Darwin", "Aristotle", "Socrates", "Plato",
  "Homer", "Michelangelo", "Galileo", "Caesar", "Lincoln"
];

export default function CreateLobbyButton({ userId }: { userId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateLobby = async () => {
    setIsCreating(true);
    const supabase = createClient();

    try {
      const guestSessionStr = sessionStorage.getItem('guest_session');
      const isGuest = !!guestSessionStr;
      
      let hostId = userId;

      if (isGuest) {
        const guestSession = JSON.parse(guestSessionStr || '{}');
        // Use guest session ID as the host ID
        hostId = guestSession.id;
      }

      const { data: lobby, error: lobbyError } = await supabase
        .from("lobbies")
        .insert({
          host_id: hostId,
          status: "waiting",
          deck_name: "Default Deck",
          deck_words: DEFAULT_WORDS,
          max_rounds: 5,
          password: isPrivate && password ? password : null,
          is_guest_lobby: isGuest, // Track if this is a guest lobby
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      const { error: playerError } = await supabase
        .from("lobby_players")
        .insert({
          lobby_id: lobby.id,
          user_id: hostId,
          score: 0,
        });

      if (playerError) throw playerError;

      router.push(`/game/lobby/${lobby.id}`);
    } catch (error) {
      console.error("[v0] Error creating lobby:", error);
      alert("Failed to create lobby");
    } finally {
      setIsCreating(false);
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-purple-300 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <PlusCircle className="w-6 h-6" />
              Create New Game
            </CardTitle>
            <CardDescription>Start a new lobby and invite friends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Create Lobby
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lobby</DialogTitle>
          <DialogDescription>Choose your lobby settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="private" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Private Lobby
            </Label>
          </div>
          
          {isPrivate && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter lobby password"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Players will need this password to join
              </p>
            </div>
          )}

          <Button
            onClick={handleCreateLobby}
            disabled={isCreating || (isPrivate && !password)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? "Creating..." : "Create Lobby"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
