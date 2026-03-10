import { apiClient } from "@/lib/api-client"
import type { Chat, Message } from "@/components/chat/types"

export async function fetchChats(): Promise<Chat[]> {
  // TODO: replace with real API call
  const { initialChats } = await import("@/lib/data")
  return initialChats
}

export async function fetchChat(chatId: string): Promise<Chat> {
  // TODO: replace with real API call
  const { initialChats } = await import("@/lib/data")
  const chat = initialChats.find((c) => c.id === chatId)
  if (!chat) throw new Error(`Chat ${chatId} not found`)
  return chat
}

export async function fetchChatDetails(chatId: string): Promise<Chat> {
  return fetchChat(chatId)
}

export async function fetchMessages(
  chatId: string,
  _cursor?: string,
): Promise<{ items: Message[]; nextCursor: string | null }> {
  // TODO: replace with real API call
  const { initialMessages } = await import("@/lib/data")
  const items = (initialMessages[chatId] ?? []).slice().reverse()
  return { items, nextCursor: null }
}

export async function updateChatSettings(
  chatId: string,
  settings: { isPinned?: boolean; isMuted?: boolean },
): Promise<void> {
  await apiClient.patch(`/chats/${chatId}/settings`, settings)
}

export async function leaveChat(chatId: string): Promise<void> {
  await apiClient.delete(`/chats/${chatId}`)
}

export async function createDirectChat(userId: string): Promise<Chat> {
  const { data } = await apiClient.post("/chats", { type: "direct", participantIds: [userId] })
  return data
}

export async function createGroupChat(name: string, userIds: string[]): Promise<Chat> {
  const { data } = await apiClient.post("/chats", { type: "group", name, participantIds: userIds })
  return data
}

export async function updateChat(
  chatId: string,
  body: { name?: string; description?: string },
): Promise<void> {
  await apiClient.patch(`/chats/${chatId}`, body)
}

export async function addParticipants(chatId: string, userIds: string[]): Promise<void> {
  await apiClient.post(`/chats/${chatId}/participants`, { userIds })
}

export async function removeParticipant(chatId: string, userId: string): Promise<void> {
  await apiClient.delete(`/chats/${chatId}/participants/${userId}`)
}

export async function sendMessage(chatId: string, content: string): Promise<Message> {
  const { data } = await apiClient.post(`/chats/${chatId}/messages`, { content })
  return data
}
