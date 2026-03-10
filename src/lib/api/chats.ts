import type { Chat, Message } from "@/components/chat/types"
import {
  initialChats,
  initialMessages,
  mockContacts,
  mockUser,
  nextMessageId,
  nextChatId,
} from "@/lib/data"

// In-memory store for mock data
const chatsStore = [...initialChats]
const messagesStore: Record<string, Message[]> = { ...initialMessages }

export async function fetchChats(): Promise<Chat[]> {
  return chatsStore
}

export async function fetchChat(chatId: string): Promise<Chat> {
  const chat = chatsStore.find((c) => c.id === chatId)
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
  const items = (messagesStore[chatId] ?? []).slice().reverse()
  return { items, nextCursor: null }
}

export async function updateChatSettings(
  chatId: string,
  settings: { isPinned?: boolean; isMuted?: boolean },
): Promise<void> {
  const idx = chatsStore.findIndex((c) => c.id === chatId)
  if (idx >= 0) {
    chatsStore[idx] = {
      ...chatsStore[idx],
      pinnedAt: settings.isPinned ? new Date().toISOString() : undefined,
    }
  }
}

export async function leaveChat(chatId: string): Promise<void> {
  const idx = chatsStore.findIndex((c) => c.id === chatId)
  if (idx >= 0) chatsStore.splice(idx, 1)
  delete messagesStore[chatId]
}

export async function createDirectChat(userId: string): Promise<Chat> {
  // Check if a chat with this user already exists
  const existing = chatsStore.find((c) => c.type === "direct" && c.otherUserId === userId)
  if (existing) return existing

  const contact = mockContacts.find((c) => c.user.id === userId)
  const newChat: Chat = {
    id: nextChatId(),
    type: "direct",
    name: contact?.user.name ?? "Unknown User",
    avatar: contact?.user.image ?? undefined,
    lastMessage: undefined,
    lastMessageAt: undefined,
    unreadCount: 0,
    otherUserId: userId,
    otherUserOnline: contact?.user.isOnline ?? false,
  }
  chatsStore.unshift(newChat)
  messagesStore[newChat.id] = []
  return newChat
}

export async function createGroupChat(name: string, userIds: string[]): Promise<Chat> {
  const newChat: Chat = {
    id: nextChatId(),
    type: "group",
    name,
    avatar: undefined,
    lastMessage: undefined,
    lastMessageAt: undefined,
    unreadCount: 0,
    participantCount: userIds.length + 1,
  }
  chatsStore.unshift(newChat)
  messagesStore[newChat.id] = []
  return newChat
}

export async function updateChat(
  chatId: string,
  body: { name?: string; description?: string },
): Promise<void> {
  const idx = chatsStore.findIndex((c) => c.id === chatId)
  if (idx >= 0) {
    chatsStore[idx] = { ...chatsStore[idx], ...body }
  }
}

export async function addParticipants(_chatId: string, _userIds: string[]): Promise<void> {
  // no-op for mock
}

export async function removeParticipant(_chatId: string, _userId: string): Promise<void> {
  // no-op for mock
}

export async function sendMessage(chatId: string, content: string): Promise<Message> {
  const now = new Date().toISOString()
  const newMsg: Message = {
    id: nextMessageId(),
    chatId,
    senderId: mockUser.id,
    type: "text",
    content,
    createdAt: now,
    updatedAt: now,
  }

  if (!messagesStore[chatId]) messagesStore[chatId] = []
  messagesStore[chatId].push(newMsg)

  // Update chat's last message
  const idx = chatsStore.findIndex((c) => c.id === chatId)
  if (idx >= 0) {
    chatsStore[idx] = {
      ...chatsStore[idx],
      lastMessage: content,
      lastMessageAt: now,
    }
  }

  return newMsg
}
