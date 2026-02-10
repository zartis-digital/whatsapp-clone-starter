import type { Chat, Message } from "@/components/chat/types"

export const mockUser = {
  id: "user-1",
  name: "Workshop User",
  email: "user@workshop.local",
  emailVerified: true,
  image: null,
  username: "workshop_user",
  bio: "Claude Code Labs participant",
  role: "user",
  isOnline: true,
  lastSeen: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockContacts = [
  {
    id: "contact-1",
    user: {
      id: "user-2",
      name: "Alice Johnson",
      email: "alice@example.com",
      image: null,
      username: "alice_j",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "contact-2",
    user: {
      id: "user-3",
      name: "Bob Smith",
      email: "bob@example.com",
      image: null,
      username: "bob_s",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "contact-3",
    user: {
      id: "user-4",
      name: "Carol Davis",
      email: "carol@example.com",
      image: null,
      username: "carol_d",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
]

export const mockPendingRequests = [
  {
    id: "request-1",
    direction: "inbound" as const,
    from: {
      id: "user-5",
      name: "Diana Prince",
      email: "diana@example.com",
      image: null,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "request-2",
    direction: "outbound" as const,
    to: {
      id: "user-6",
      name: "Eve Martinez",
      email: "eve@example.com",
      image: null,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000).toISOString(),
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const initialChats: Chat[] = [
  {
    id: "chat-1",
    type: "direct",
    name: "Alice Johnson",
    avatar: undefined,
    lastMessage: "Hey! How's the workshop going?",
    lastMessageAt: new Date(Date.now() - 60000).toISOString(),
    unreadCount: 1,
    otherUserId: "user-2",
    otherUserOnline: true,
  },
  {
    id: "chat-2",
    type: "direct",
    name: "Dario Amodei",
    avatar: undefined,
    lastMessage: "Have an amazing hackathon session! Build something awesome 🚀",
    lastMessageAt: new Date(Date.now() - 30000).toISOString(),
    unreadCount: 1,
    otherUserId: "user-7",
    otherUserOnline: true,
  },
]

export const initialMessages: Record<string, Message[]> = {
  "chat-2": [
    {
      id: "msg-4",
      chatId: "chat-2",
      senderId: "user-7",
      type: "text",
      content: "Hey there! Dario here from Anthropic. Just wanted to drop in and wish you an incredible hackathon session today! 🎉",
      createdAt: new Date(Date.now() - 120000).toISOString(),
      updatedAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: "msg-5",
      chatId: "chat-2",
      senderId: "user-7",
      type: "text",
      content: "Have an amazing hackathon session! Build something awesome 🚀",
      createdAt: new Date(Date.now() - 30000).toISOString(),
      updatedAt: new Date(Date.now() - 30000).toISOString(),
    },
  ],
  "chat-1": [
    {
      id: "msg-1",
      chatId: "chat-1",
      senderId: "user-1",
      type: "text",
      content: "Hi Alice! Ready for the workshop? 🚀",
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "msg-2",
      chatId: "chat-1",
      senderId: "user-2",
      type: "text",
      content: "Absolutely! This is going to be fun.",
      createdAt: new Date(Date.now() - 120000).toISOString(),
      updatedAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: "msg-3",
      chatId: "chat-1",
      senderId: "user-2",
      type: "text",
      content: "Hey! How's the workshop going?",
      createdAt: new Date(Date.now() - 60000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString(),
    },
  ],
}

let messageCounter = 100
export function nextMessageId(): string {
  return `msg-${++messageCounter}`
}

let chatCounter = 100
export function nextChatId(): string {
  return `chat-${++chatCounter}`
}

let requestCounter = 100
export function nextRequestId(): string {
  return `request-${++requestCounter}`
}
