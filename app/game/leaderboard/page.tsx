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
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: leaderboard } = await supabase
    .from("leaderboard")
    .select("*")
    .order("wins", { ascending: false })
    .limit(50);

  const userRank = leaderboard?.findIndex(entry => entry.user_id === data.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobbies
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-600 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Global Leaderboard
            </CardTitle>
            <CardDescription>
              Top players by total wins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      entry.user_id === data.user.id
                        ? "bg-purple-100 border-2 border-purple-500"
                        : index < 3
                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                        : "bg-white border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {index === 0 && (
                          <Trophy className="w-8 h-8 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Medal className="w-7 h-7 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Award className="w-6 h-6 text-orange-600" />
                        )}
                        {index > 2 && (
                          <span className="text-xl font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {entry.display_name}
                        </p>
                        {entry.user_id === data.user.id && (
                          <span className="text-xs text-purple-600 font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {entry.wins}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.wins === 1 ? "win" : "wins"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No leaderboard entries yet. Be the first to win!
                  </p>
                </div>
              )}
            </div>

            {userRank !== undefined && userRank >= 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-center text-sm text-muted-foreground">
                  Your current rank:{" "}
                  <span className="font-bold text-purple-600 text-lg">
                    #{userRank + 1}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
