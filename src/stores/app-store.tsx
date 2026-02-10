import { Store, useStore } from "@tanstack/react-store"
import type { Chat, Message } from "@/components/chat/types"
import type { Contact, PendingRequest } from "@/components/contacts/types"
import {
  initialChats,
  initialMessages,
  mockUser,
  mockContacts,
  mockPendingRequests,
  nextMessageId,
  nextRequestId,
} from "@/lib/data"

interface AppState {
  chats: Chat[]
  messages: Record<string, Message[]>
  contacts: Contact[]
  pendingRequests: PendingRequest[]
}

export const appStore = new Store<AppState>({
  chats: initialChats,
  messages: initialMessages,
  contacts: mockContacts as Contact[],
  pendingRequests: mockPendingRequests as PendingRequest[],
})

export function useChats() {
  return useStore(appStore, (s) => s.chats)
}

export function useMessages(chatId: string) {
  return useStore(appStore, (s) => s.messages[chatId] || [])
}

export function useCurrentUserId() {
  return mockUser.id
}

export function useCurrentUser() {
  return mockUser
}

export function useContacts() {
  return useStore(appStore, (s) => s.contacts)
}

export function useContact(contactId: string) {
  return useStore(appStore, (s) => s.contacts.find((c) => c.id === contactId))
}

export function usePendingRequests() {
  return useStore(appStore, (s) => s.pendingRequests)
}

export function sendMessage(chatId: string, content: string) {
  const newMsg: Message = {
    id: nextMessageId(),
    chatId,
    senderId: mockUser.id,
    type: "text",
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  appStore.setState((prev) => {
    const updatedMessages = {
      ...prev.messages,
      [chatId]: [...(prev.messages[chatId] || []), newMsg],
    }

    const updatedChats = prev.chats
      .map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: content, lastMessageAt: newMsg.createdAt }
          : c
      )
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })

    return { ...prev, chats: updatedChats, messages: updatedMessages }
  })
}

export function acceptRequest(requestId: string) {
  appStore.setState((prev) => {
    const request = prev.pendingRequests.find((r) => r.id === requestId)
    if (!request || request.direction !== "inbound" || !request.from) return prev

    const newContact: Contact = {
      id: `contact-${request.from.id}`,
      user: request.from,
      createdAt: new Date().toISOString(),
    }

    return {
      ...prev,
      contacts: [...prev.contacts, newContact],
      pendingRequests: prev.pendingRequests.filter((r) => r.id !== requestId),
    }
  })
}

export function rejectRequest(requestId: string) {
  appStore.setState((prev) => ({
    ...prev,
    pendingRequests: prev.pendingRequests.filter((r) => r.id !== requestId),
  }))
}

export function cancelRequest(requestId: string) {
  appStore.setState((prev) => ({
    ...prev,
    pendingRequests: prev.pendingRequests.filter((r) => r.id !== requestId),
  }))
}

export function useArchivedChats() {
  return useStore(appStore, (s) => s.chats.filter((c) => !!c.archivedAt))
}

export function pinChat(chatId: string) {
  appStore.setState((prev) => ({
    ...prev,
    chats: prev.chats.map((c) =>
      c.id === chatId
        ? { ...c, pinnedAt: c.pinnedAt ? undefined : new Date().toISOString() }
        : c
    ),
  }))
}

export function archiveChat(chatId: string) {
  appStore.setState((prev) => ({
    ...prev,
    chats: prev.chats.map((c) =>
      c.id === chatId ? { ...c, archivedAt: new Date().toISOString() } : c
    ),
  }))
}

export function unarchiveChat(chatId: string) {
  appStore.setState((prev) => ({
    ...prev,
    chats: prev.chats.map((c) =>
      c.id === chatId ? { ...c, archivedAt: undefined } : c
    ),
  }))
}

export function deleteChat(chatId: string) {
  appStore.setState((prev) => {
    const { [chatId]: _, ...remainingMessages } = prev.messages
    return {
      ...prev,
      chats: prev.chats.filter((c) => c.id !== chatId),
      messages: remainingMessages,
    }
  })
}

export function sendContactRequest(emailOrUsername: string) {
  const newRequest: PendingRequest = {
    id: nextRequestId(),
    direction: "outbound",
    to: {
      id: `user-${Date.now()}`,
      name: emailOrUsername,
      email: emailOrUsername.includes("@") ? emailOrUsername : `${emailOrUsername}@example.com`,
      image: null,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  }

  appStore.setState((prev) => ({
    ...prev,
    pendingRequests: [...prev.pendingRequests, newRequest],
  }))
}
