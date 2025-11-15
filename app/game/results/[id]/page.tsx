import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, Crown, Home, BarChart, RotateCcw } from 'lucide-react';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: lobby } = await supabase
    .from("lobbies")
    .select("*")
    .eq("id", id)
    .single();

  if (!lobby) {
    redirect("/game");
  }

  const { data: players } = await supabase
    .from("lobby_players")
    .select(`
      *,
      profiles(id, display_name, email)
    `)
    .eq("lobby_id", id)
    .order("score", { ascending: false });

  const winner = players?.[0];

  async function handleRematch() {
    "use server";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id !== lobby.host_id) {
      return;
    }

    // Create new lobby with same settings and players
    const { data: newLobby, error: lobbyError } = await supabase
      .from("lobbies")
      .insert({
        host_id: user.id,
        status: "waiting",
        deck_name: lobby.deck_name,
        deck_words: lobby.deck_words,
        max_rounds: lobby.max_rounds,
      })
      .select()
      .single();

    if (lobbyError || !newLobby) return;

    // Add all players from previous game
    const playerInserts = players?.map(p => ({
      lobby_id: newLobby.id,
      user_id: p.user_id,
      score: 0,
    }));

    if (playerInserts) {
      await supabase.from("lobby_players").insert(playerInserts);
    }

    redirect(`/game/lobby/${newLobby.id}`);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
            <CardTitle className="text-4xl font-bold text-primary mb-2">
              Game Over!
            </CardTitle>
            <CardDescription className="text-lg">
              {winner && (
                <>
                  <Crown className="w-5 h-5 inline text-yellow-500 mr-2" />
                  Winner: {winner.profiles.display_name}
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Final Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players?.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? "bg-yellow-500/20 border-2 border-yellow-500 dark:bg-yellow-500/10"
                      : index === 1
                      ? "bg-muted/50 border"
                      : index === 2
                      ? "bg-orange-500/20 border dark:bg-orange-500/10"
                      : "bg-card border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow">
                      {index === 0 && (
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Trophy className="w-5 h-5 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Trophy className="w-4 h-4 text-orange-600" />
                      )}
                      {index > 2 && (
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">
                        {player.profiles.display_name}
                      </p>
                      {player.user_id === data.user.id && (
                        <span className="text-xs text-primary font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {player.score}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.score === 1 ? "point" : "points"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/game">
              <Home className="w-4 h-4 mr-2" />
              Back to Lobbies
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/game/leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Link>
          </Button>
          {lobby.host_id === data.user.id && (
            <form action={handleRematch}>
              <Button type="submit" variant="outline" size="lg" className="border-purple-300">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rematch
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
