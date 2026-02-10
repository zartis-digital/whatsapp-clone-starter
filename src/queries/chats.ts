import { queryOptions, infiniteQueryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import * as chatsApi from "@/lib/api/chats"
import type { Chat } from "@/components/chat/types"

export const chatsQueryOptions = queryOptions({
  queryKey: ["chats"],
  queryFn: chatsApi.fetchChats,
  staleTime: 0,
})

export const chatQueryOptions = (chatId: string) =>
  queryOptions({
    queryKey: ["chats", chatId],
    queryFn: () => chatsApi.fetchChat(chatId),
  })

export const chatDetailsQueryOptions = (chatId: string) =>
  queryOptions({
    queryKey: ["chat-details", chatId],
    queryFn: () => chatsApi.fetchChatDetails(chatId),
  })

export const messagesQueryOptions = (chatId: string) =>
  infiniteQueryOptions({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam }) => chatsApi.fetchMessages(chatId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

export function useCreateDirectChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId }: { userId: string; userName: string; userImage?: string }) =>
      chatsApi.createDirectChat(userId),
    onSuccess: (chat, { userId, userName, userImage }) => {
      queryClient.setQueryData<Chat[]>(chatsQueryOptions.queryKey, (oldChats) => {
        if (oldChats?.some((c) => c.id === chat.id)) return oldChats
        const newChat: Chat = {
          ...chat,
          name: userName,
          avatar: userImage,
          otherUserId: userId,
        }
        return [newChat, ...(oldChats || [])]
      })
    },
  })
}
