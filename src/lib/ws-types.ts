// WebSocket message types - matches backend
export type WSMessageType =
  | "subscribe"
  | "unsubscribe"
  | "typing"
  | "stop_typing"
  | "presence"
  | "message"
  | "message_edited"
  | "message_deleted"
  | "read_receipt"
  | "delivery_receipt"
  | "user_online"
  | "user_offline"
  | "contact_request"
  | "contact_accepted"
  | "contact_removed"
  | "removed_from_chat"
  | "added_to_chat"
  | "participants_changed"
  | "chat_settings_updated"
  | "reaction_added"
  | "reaction_removed"
  | "error"

export interface WSMessage<T = unknown> {
  type: WSMessageType
  payload: T
}

// Payload types for each message
export interface PresencePayload {
  status: "connected"
  subscribedChats: string[]
}

export interface SubscribePayload {
  chatId: string
  success?: boolean
}

export interface UnsubscribePayload {
  chatId: string
  success?: boolean
}

export interface TypingPayload {
  chatId: string
  userId?: string
}

export interface UserStatusPayload {
  userId: string
}

export interface ErrorPayload {
  message: string
}

export interface MessagePayload {
  id: string
  chatId: string
  senderId: string | null
  type: "text" | "image" | "video" | "audio" | "file"
  content: string
  replyToId?: string | null
  forwardedFromId?: string | null
  editedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface MessageEditedPayload extends MessagePayload {
  editedAt: string
}

export interface MessageDeletedPayload {
  chatId: string
  messageId: string
}

export interface ReadReceiptPayload {
  chatId: string
  userId: string
  readAt: string
}

export interface DeliveryReceiptPayload {
  chatId: string
  messageIds: string[]
  userId: string
  deliveredAt: string
}

// Contact request payload (recipient receives this)
export interface ContactRequestPayload {
  id: string
  from: {
    id: string
    name: string
    email: string
    image: string | null
  }
  createdAt: string
}

// Contact accepted payload (sender receives this)
export interface ContactAcceptedPayload {
  id: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  acceptedAt: string
}

// Contact removed payload (other user receives when contact is removed)
export interface ContactRemovedPayload {
  chatId: string
  contactName: string
}

// Removed from chat payload (user receives when removed from group)
export interface RemovedFromChatPayload {
  chatId: string
  chatName: string
  removedBy: string | null // null if user left themselves
}

// Added to chat payload (user receives when added to group)
export interface AddedToChatPayload {
  chatId: string
}

// Participants changed payload (broadcast when members are added/removed)
export interface ParticipantsChangedPayload {
  chatId: string
}

// Chat settings updated payload (broadcast to user's other devices)
export interface ChatSettingsUpdatedPayload {
  chatId: string
  isMuted?: boolean
  isPinned?: boolean
}

// Reaction payloads
export interface ReactionPayload {
  messageId: string
  chatId: string
  userId: string
  emoji: string
  user: { id: string; name: string; image: string | null }
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting"
