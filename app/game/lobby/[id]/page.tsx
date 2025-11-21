import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LobbyRoom from "@/components/lobby-room"

export default async function LobbyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const search = await searchParams
  const autoJoin = search.join === "true"

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/auth/login?redirect=/game/lobby/${id}${autoJoin ? "?join=true" : ""}`)
  }

  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", id).single()

  if (!lobby) {
    redirect("/game")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: existingPlayer } = await supabase
    .from("lobby_players")
    .select("id")
    .eq("lobby_id", id)
    .eq("user_id", data.user.id)
    .is("kicked_at", null)
    .single()

  if (autoJoin && !existingPlayer && lobby.status === "waiting") {
    await supabase.from("lobby_players").insert({
      lobby_id: id,
      user_id: data.user.id,
      score: 0,
    })
  }

  return <LobbyRoom lobbyId={id} userId={data.user.id} userProfile={profile} initialLobby={lobby} />
}
