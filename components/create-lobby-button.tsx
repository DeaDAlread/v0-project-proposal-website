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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateLobby = async () => {
    if (isPrivate && !password.trim()) {
      setError("Please enter a password for private lobby");
      return;
    }

    setIsCreating(true);
    setError(null);
    const supabase = createClient();

    try {
      const guestSessionStr = sessionStorage.getItem('guest_session');
      const isGuest = !!guestSessionStr;
      
      let hostId = userId;

      if (isGuest) {
        const guestSession = JSON.parse(guestSessionStr || '{}');
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
          current_round: 0,
          round_duration: 60,
          password: isPrivate ? password : null,
        })
        .select()
        .single();

      if (lobbyError) {
        console.error("[v0] Lobby creation error:", lobbyError);
        throw new Error(lobbyError.message || "Failed to create lobby");
      }

      const { error: playerError } = await supabase
        .from("lobby_players")
        .insert({
          lobby_id: lobby.id,
          user_id: hostId,
          score: 0,
        });

      if (playerError) {
        console.error("[v0] Player insertion error:", playerError);
        throw new Error(playerError.message || "Failed to join lobby");
      }

      console.log("[v0] Lobby created successfully:", lobby.id);
      router.push(`/game/lobby/${lobby.id}`);
    } catch (error: any) {
      console.error("[v0] Error creating lobby:", error);
      setError(error.message || "Failed to create lobby");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PlusCircle className="w-6 h-6" />
              Create New Game
            </CardTitle>
            <CardDescription>Start a new lobby and invite friends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
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
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
              <Lock className="w-4 h-4" />
              Private Lobby
            </Label>
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter lobby password"
              />
              <p className="text-sm text-muted-foreground">
                Players will need this password to join
              </p>
            </div>
          )}

          <Button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create Lobby"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
