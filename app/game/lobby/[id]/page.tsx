import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import LobbyRoom from "@/components/lobby-room";

export default async function LobbyPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return (
    <LobbyRoom
      lobbyId={id}
      userId={data.user.id}
      userProfile={profile}
      initialLobby={lobby}
    />
  );
}
