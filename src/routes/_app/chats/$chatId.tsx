import { createFileRoute, useNavigate, type ErrorComponentProps } from "@tanstack/react-router"
import { useCallback } from "react"
import { useSuspenseQuery, useSuspenseInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { ChatPanel } from "@/components/chat/chat-panel"
import { Button } from "@/components/ui/button"
import { useCurrentUserId } from "@/hooks/use-current-user"
import { useTypingIndicator, useTypingUsers } from "@/hooks/use-websocket"
import { chatsQueryOptions, messagesQueryOptions } from "@/queries/chats"
import * as chatsApi from "@/lib/api/chats"
import type { Chat, Message } from "@/components/chat/types"
import type { InfiniteData } from "@tanstack/react-query"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/_app/chats/$chatId")({
  component: ChatPage,
  errorComponent: ChatError,
  head: () => ({
    meta: seo({ title: "Chat | WhatsApp Clone" }),
  }),
})

function ChatPage() {
  const { chatId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUserId = useCurrentUserId()

  const { data: chats } = useSuspenseQuery(chatsQueryOptions)
  const { data: messagesData } = useSuspenseInfiniteQuery(messagesQueryOptions(chatId))

  const chat = chats.find((c) => c.id === chatId)
  const messages = messagesData.pages.flatMap((page) => page.items)

  const { startTyping, stopTyping } = useTypingIndicator(chatId)
  const typingUsers = useTypingUsers(chatId)

  const handleSendMessage = useCallback(async (content: string) => {
    stopTyping()

    const tempId = `temp-${Date.now()}`
    const now = new Date().toISOString()
    const tempMessage: Message = {
      id: tempId,
      chatId,
      senderId: currentUserId,
      type: "text",
      content,
      createdAt: now,
      updatedAt: now,
    }

    // Optimistic update: add temp message to cache
    queryClient.setQueryData<InfiniteData<{ items: Message[]; nextCursor: string | null }>>(
      messagesQueryOptions(chatId).queryKey,
      (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: [
            { ...oldData.pages[0], items: [tempMessage, ...oldData.pages[0].items] },
            ...oldData.pages.slice(1),
          ],
        }
      },
    )

    // Optimistic update: update chat's lastMessage
    queryClient.setQueryData<Chat[]>(chatsQueryOptions.queryKey, (oldChats) =>
      oldChats?.map((c) =>
        c.id === chatId ? { ...c, lastMessage: content, lastMessageAt: now } : c,
      ),
    )

    try {
      const realMessage = await chatsApi.sendMessage(chatId, content)
      // Replace temp message with real one
      queryClient.setQueryData<InfiniteData<{ items: Message[]; nextCursor: string | null }>>(
        messagesQueryOptions(chatId).queryKey,
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((m) => (m.id === tempId ? realMessage : m)),
            })),
          }
        },
      )
    } catch {
      // Remove temp message on failure
      queryClient.setQueryData<InfiniteData<{ items: Message[]; nextCursor: string | null }>>(
        messagesQueryOptions(chatId).queryKey,
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.filter((m) => m.id !== tempId),
            })),
          }
        },
      )
    }
  }, [chatId, currentUserId, queryClient, stopTyping])

  if (!chat) {
    navigate({ to: "/chats" })
    return null
  }

  return (
    <ChatPanel
      chat={chat}
      messages={messages}
      currentUserId={currentUserId}
      onSendMessage={handleSendMessage}
      onInputChange={startTyping}
      typingUsers={typingUsers}
    />
  )
}

function ChatError({ error: _error }: ErrorComponentProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-muted-foreground text-lg">This conversation is no longer available.</p>
      <Button variant="outline" onClick={() => navigate({ to: "/chats" })}>Back to Chats</Button>
    </div>
  )
}
