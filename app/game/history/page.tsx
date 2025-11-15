'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type GameHistory = {
  id: string;
  winner_name: string;
  winner_score: number;
  total_rounds: number;
  deck_name: string;
  player_count: number;
  played_at: string;
  players: {
    display_name: string;
    final_score: number;
    placement: number;
  }[];
};

export default function GameHistoryPage() {
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      fetchGameHistory(user.id);
    };

    checkAuth();
  }, []);

  const fetchGameHistory = async (userId: string) => {
    try {
      const { data: historyData, error } = await supabase
        .from('game_history')
        .select(`
          *,
          game_history_players(display_name, final_score, placement)
        `)
        .or(`host_id.eq.${userId},winner_id.eq.${userId}`)
        .order('played_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedGames = (historyData || []).map((game: any) => ({
        ...game,
        players: game.game_history_players.sort((a: any, b: any) => a.placement - b.placement)
      }));

      setGames(formattedGames);
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,hsl(var(--gradient-from)),hsl(var(--gradient-via)),hsl(var(--gradient-to)))] p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobbies
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Game History
            </CardTitle>
          </CardHeader>
        </Card>

        {games.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No game history yet. Play some games to see them here!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h3 className="font-bold text-lg">{game.winner_name} Won!</h3>
                        <p className="text-sm text-muted-foreground">
                          {game.winner_score} points
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(game.played_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-4 h-4" />
                        {game.player_count} players
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Final Standings</h4>
                    {game.players.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">#{player.placement}</span>
                          <span>{player.display_name}</span>
                        </div>
                        <span className="font-medium">{player.final_score} pts</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span>{game.deck_name}</span>
                    <span>{game.total_rounds} rounds</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
