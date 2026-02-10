import { apiClient } from "@/lib/api-client"
import type { Chat, Message } from "@/components/chat/types"

export async function fetchChats(): Promise<Chat[]> {
  const { data } = await apiClient.get("/chats")
  return data
}

export async function fetchChat(chatId: string): Promise<Chat> {
  const { data } = await apiClient.get(`/chats/${chatId}`)
  return data
}

export async function fetchChatDetails(chatId: string): Promise<Chat> {
  const { data } = await apiClient.get(`/chats/${chatId}`)
  return data
}

export async function fetchMessages(
  chatId: string,
  cursor?: string,
): Promise<{ items: Message[]; nextCursor: string | null }> {
  const { data } = await apiClient.get(`/chats/${chatId}/messages`, {
    params: cursor ? { cursor } : undefined,
  })
  return data
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
