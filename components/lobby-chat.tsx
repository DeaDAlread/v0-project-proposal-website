"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  profiles: {
    display_name: string
  }
}

interface LobbyChatProps {
  lobbyId: string
  userId: string
}

export function LobbyChat({ lobbyId, userId }: LobbyChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`lobby-chat-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lobbyId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles:user_id (display_name)
      `)
      .eq("lobby_id", lobbyId)
      .order("created_at", { ascending: true })
      .limit(50)

    if (data) setMessages(data)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("chat_messages").insert({
        lobby_id: lobbyId,
        user_id: userId,
        message: newMessage.trim().slice(0, 100),
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[300px] border rounded-lg">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold">Lobby Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                msg.user_id === userId ? "items-end" : "items-start"
              }`}
            >
              <span className="text-xs text-muted-foreground">
                {msg.profiles?.display_name}
              </span>
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  msg.user_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={100}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
