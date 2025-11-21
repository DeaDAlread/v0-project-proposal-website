import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResultsPageClient } from "@/components/results-page-client"

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", id).single()

  if (!lobby) {
    redirect("/game")
  }

  const { data: players } = await supabase
    .from("lobby_players")
    .select(`
      *,
      profiles(id, display_name, email, profile_picture)
    `)
    .eq("lobby_id", id)
    .order("score", { ascending: false })

  const winner = players?.[0]

  async function handleRematch() {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== lobby.host_id) {
      return
    }

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
      .single()

    if (lobbyError || !newLobby) return

    const playerInserts = players?.map((p) => ({
      lobby_id: newLobby.id,
      user_id: p.user_id,
      score: 0,
    }))

    if (playerInserts) {
      await supabase.from("lobby_players").insert(playerInserts)
    }

    redirect(`/game/lobby/${newLobby.id}`)
  }

  return (
    <ResultsPageClient
      lobby={lobby}
      players={players || []}
      winner={winner}
      currentUserId={data.user.id}
      handleRematch={handleRematch}
    />
  )
}
