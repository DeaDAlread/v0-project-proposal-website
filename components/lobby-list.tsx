"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, Lock } from 'lucide-react';
import { LobbyListSkeleton } from "@/components/loading-skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Lobby = {
  id: string;
  host_id: string;
  status: string;
  current_round: number;
  max_rounds: number;
  deck_name: string;
  created_at: string;
  password?: string | null;
  profiles: {
    display_name: string;
  };
  player_count?: number;
};

export default function LobbyList({ userId }: { userId: string }) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchLobbies();

    const channel = supabase
      .channel("lobbies_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lobbies" },
        () => {
          fetchLobbies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLobbies = async () => {
    try {
      const { data: lobbiesData, error } = await supabase
        .from("lobbies")
        .select(`
          *,
          profiles!lobbies_host_id_fkey(display_name)
        `)
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const lobbyIds = (lobbiesData || []).map(l => l.id);
      const { data: playerCounts } = await supabase
        .from("lobby_players")
        .select("lobby_id")
        .in("lobby_id", lobbyIds);

      const countMap = new Map<string, number>();
      (playerCounts || []).forEach((pc: any) => {
        countMap.set(pc.lobby_id, (countMap.get(pc.lobby_id) || 0) + 1);
      });

      const lobbiesWithCount = (lobbiesData || []).map((lobby: any) => ({
        ...lobby,
        player_count: countMap.get(lobby.id) || 0
      }));

      setLobbies(lobbiesWithCount);
    } catch (error) {
      console.error("Error fetching lobbies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLobby = async (lobbyId: string, hasPassword: boolean = false) => {
    if (hasPassword && !passwordInput && passwordDialog !== lobbyId) {
      setPasswordDialog(lobbyId);
      return;
    }

    try {
      if (hasPassword && passwordInput) {
        const { data: lobby } = await supabase
          .from("lobbies")
          .select("password")
          .eq("id", lobbyId)
          .single();

        if (lobby?.password !== passwordInput) {
          alert("Incorrect password");
          setPasswordInput("");
          return;
        }
      }

      const { data: existingPlayer } = await supabase
        .from("lobby_players")
        .select("id")
        .eq("lobby_id", lobbyId)
        .eq("user_id", userId)
        .single();

      if (existingPlayer) {
        router.push(`/game/lobby/${lobbyId}`);
        setPasswordDialog(null);
        setPasswordInput("");
        return;
      }

      const { error } = await supabase.from("lobby_players").insert({
        lobby_id: lobbyId,
        user_id: userId,
        score: 0,
      });

      if (error) throw error;

      router.push(`/game/lobby/${lobbyId}`);
      setPasswordDialog(null);
      setPasswordInput("");
    } catch (error: any) {
      console.error("Error joining lobby:", error);
      if (error.code === "23505") {
        router.push(`/game/lobby/${lobbyId}`);
      } else {
        alert("Failed to join lobby");
      }
    }
  };

  if (isLoading) {
    return <LobbyListSkeleton />;
  }

  if (lobbies.length === 0) {
    return (
      <Card className="col-span-2">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No active lobbies. Create one to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {lobbies.map((lobby) => (
        <Card
          key={lobby.id}
          className="hover:shadow-lg transition-shadow border-purple-200"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              {lobby.profiles.display_name}'s Game
            </CardTitle>
            <CardDescription>
              Round {lobby.current_round}/{lobby.max_rounds} • {lobby.deck_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{lobby.player_count} players</span>
                {lobby.password && (
                  <Lock className="w-4 h-4 text-purple-500 ml-2" />
                )}
              </div>
              <Button
                onClick={() => handleJoinLobby(lobby.id, !!lobby.password)}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
              >
                Join Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {passwordDialog && (
        <Dialog open={!!passwordDialog} onOpenChange={() => {
          setPasswordDialog(null);
          setPasswordInput("");
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Private Lobby</DialogTitle>
              <DialogDescription>Enter the password to join</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lobby-password">Password</Label>
                <Input
                  id="lobby-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && passwordInput) {
                      handleJoinLobby(passwordDialog, true);
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => handleJoinLobby(passwordDialog, true)}
                disabled={!passwordInput}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Join
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
