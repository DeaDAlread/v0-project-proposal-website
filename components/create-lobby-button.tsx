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
import { useLanguage } from "@/lib/language-context";

const DEFAULT_WORDS = [
  "Einstein", "Picasso", "Shakespeare", "Cleopatra", "Napoleon",
  "Mozart", "Tesla", "Da Vinci", "Gandhi", "Beethoven",
  "Newton", "Darwin", "Aristotle", "Socrates", "Plato",
  "Homer", "Michelangelo", "Galileo", "Caesar", "Lincoln"
];

export default function CreateLobbyButton({ userId, isGuest = false }: { userId: string; isGuest?: boolean }) {
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const handleCreateLobby = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    if (roomName.trim().length < 3) {
      setError("Room name must be at least 3 characters");
      return;
    }

    if (isPrivate && !password.trim()) {
      setError("Please enter a password for private lobby");
      return;
    }

    if (isPrivate && password.trim().length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (isGuest && isPrivate) {
      setError("Guest users cannot create private lobbies");
      return;
    }

    setIsCreating(true);
    setError(null);
    const supabase = createClient();

    try {
      const guestSessionStr = sessionStorage.getItem('guest_session');
      const isGuestUser = isGuest || !!guestSessionStr;
      
      let hostId = userId;

      if (isGuestUser && guestSessionStr) {
        const guestSession = JSON.parse(guestSessionStr);
        hostId = guestSession.id;
        console.log("[v0] Guest user creating lobby with ID:", hostId);
      }

      const lobbyData: any = {
        host_id: hostId,
        name: roomName.trim(),
        status: "waiting",
        deck_name: "Default Deck",
        deck_words: DEFAULT_WORDS,
        max_rounds: 5,
        current_round: 0,
        round_duration: 60,
      };

      if (isPrivate && password.trim() && !isGuestUser) {
        lobbyData.password = password.trim();
      }

      console.log("[v0] Creating lobby with data:", { ...lobbyData, password: lobbyData.password ? '***' : undefined });

      const { data: lobby, error: lobbyError } = await supabase
        .from("lobbies")
        .insert(lobbyData)
        .select()
        .single();

      if (lobbyError) {
        console.error("[v0] Lobby creation error:", lobbyError);
        throw new Error(lobbyError.message || "Failed to create lobby");
      }

      console.log("[v0] Lobby created successfully:", lobby.id);

      const { error: playerError } = await supabase
        .from("lobby_players")
        .insert({
          lobby_id: lobby.id,
          user_id: hostId,
          score: 0,
        });

      if (playerError) {
        console.error("[v0] Player insertion error:", playerError);
        await supabase.from("lobbies").delete().eq("id", lobby.id);
        throw new Error(playerError.message || "Failed to join lobby");
      }

      console.log("[v0] Player added to lobby successfully");

      setDialogOpen(false);
      setRoomName("");
      setPassword("");
      setIsPrivate(false);
      router.push(`/game/lobby/${lobby.id}`);
    } catch (error: any) {
      console.error("[v0] Error creating lobby:", error);
      setError(error.message || "Failed to create lobby. Please try again.");
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
              {t('create.title')}
            </CardTitle>
            <CardDescription>{t('create.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              {t('create.button')}
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('create.dialogDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="roomName">{t('create.roomName')}</Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={t('create.roomNamePlaceholder')}
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              {t('create.roomNameHelp')}
            </p>
          </div>

          {!isGuest && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="w-4 h-4" />
                  {t('create.private')}
                </Label>
              </div>

              {isPrivate && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('create.passwordLabel')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('create.passwordPlaceholder')}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('create.passwordHelp')}
                  </p>
                </div>
              )}
            </>
          )}

          <Button
            onClick={handleCreateLobby}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? t('create.creating') : t('create.button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
