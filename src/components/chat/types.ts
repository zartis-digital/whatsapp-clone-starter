export interface ChatParticipant {
  id: string
  userId: string
  isAdmin: boolean
  user: { id: string; name: string; image: string | null; isOnline: boolean }
}

export interface Chat {
  id: string
  type: "direct" | "group"
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  pinnedAt?: string
  archivedAt?: string
  // For direct chats
  otherUserId?: string
  otherUserOnline?: boolean
  // For group chats
  description?: string
  participants?: ChatParticipant[]
  currentUserIsAdmin?: boolean
}

export interface Message {
  id: string
  chatId: string
  senderId: string | null
  type: "text" | "image" | "video" | "audio" | "file"
  content: string
  replyToId?: string | null
  forwardedFromId?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  editedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  reactions?: {
    emoji: string
    count: number
    users: { id: string; name: string; image: string | null }[]
  }[]
}

// For UI display purposes
export interface DisplayMessage extends Message {
  isOwn: boolean
  senderName?: string
  senderAvatar?: string
}
