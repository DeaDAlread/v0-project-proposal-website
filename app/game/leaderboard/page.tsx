import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientLeaderboardPage } from "@/components/client-leaderboard-page"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: leaderboard } = await supabase
    .from("leaderboard")
    .select("*")
    .order("wins", { ascending: false })
    .limit(50)

  const userRank = leaderboard?.findIndex((entry) => entry.user_id === data.user.id)

  return <ClientLeaderboardPage userId={data.user.id} leaderboard={leaderboard || []} userRank={userRank} />
}
