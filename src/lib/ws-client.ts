import ReconnectingWebSocket from "reconnecting-websocket"
import type {
  WSMessage,
  WSMessageType,
  ConnectionStatus,
  PresencePayload,
  TypingPayload,
  UserStatusPayload,
  MessagePayload,
  MessageEditedPayload,
  MessageDeletedPayload,
  ReadReceiptPayload,
  DeliveryReceiptPayload,
  ContactRequestPayload,
  ContactAcceptedPayload,
  ContactRemovedPayload,
  RemovedFromChatPayload,
  AddedToChatPayload,
  ParticipantsChangedPayload,
  ChatSettingsUpdatedPayload,
  ReactionPayload,
  ErrorPayload,
} from "./ws-types"

type MessageHandler<T = unknown> = (payload: T) => void

interface WSClientOptions {
  url: string
  onStatusChange?: (status: ConnectionStatus) => void
}

class WSClient {
  private ws: ReconnectingWebSocket | null = null
  private handlers = new Map<WSMessageType, Set<MessageHandler>>()
  private options: WSClientOptions | null = null
  private _status: ConnectionStatus = "disconnected"
  private messageQueue: WSMessage[] = []

  get status(): ConnectionStatus {
    return this._status
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status
    this.options?.onStatusChange?.(status)
  }

  connect(options: WSClientOptions): void {
    this.options = options

    this.setStatus("connecting")

    // Cookies are sent automatically with the WebSocket connection
    this.ws = new ReconnectingWebSocket(options.url, [], {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.5,
      maxRetries: 10,
    })

    this.ws.onopen = () => {
      this.setStatus("connected")
      this.flushMessageQueue()
    }

    this.ws.onclose = () => {
      this.setStatus("disconnected")
    }

    this.ws.onerror = () => {
      // Errors are followed by close, status will update there
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        this.dispatch(message.type, message.payload)
      } catch (error) {
        console.error("WSClient: Failed to parse message", error)
      }
    }

    // Track reconnection attempts
    const originalOnClose = this.ws.onclose
    this.ws.onclose = (event) => {
      if (this.ws && this.ws.retryCount > 0) {
        this.setStatus("reconnecting")
      } else {
        originalOnClose?.call(this.ws, event)
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.setStatus("disconnected")
    this.messageQueue = []
  }

  private send(message: WSMessage): void {
    if (this._status === "connected" && this.ws) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue messages while disconnected
      this.messageQueue.push(message)
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this._status === "connected") {
      const message = this.messageQueue.shift()
      if (message && this.ws) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  private dispatch(type: WSMessageType, payload: unknown): void {
    const typeHandlers = this.handlers.get(type)
    if (typeHandlers) {
      typeHandlers.forEach((handler) => handler(payload))
    }
  }

  // Event subscription
  on<T>(type: WSMessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler as MessageHandler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler)
    }
  }

  off(type: WSMessageType, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  // Typed event helpers
  onPresence(handler: MessageHandler<PresencePayload>): () => void {
    return this.on("presence", handler)
  }

  onTyping(handler: MessageHandler<TypingPayload>): () => void {
    return this.on("typing", handler)
  }

  onStopTyping(handler: MessageHandler<TypingPayload>): () => void {
    return this.on("stop_typing", handler)
  }

  onUserOnline(handler: MessageHandler<UserStatusPayload>): () => void {
    return this.on("user_online", handler)
  }

  onUserOffline(handler: MessageHandler<UserStatusPayload>): () => void {
    return this.on("user_offline", handler)
  }

  onMessage(handler: MessageHandler<MessagePayload>): () => void {
    return this.on("message", handler)
  }

  onMessageEdited(handler: MessageHandler<MessageEditedPayload>): () => void {
    return this.on("message_edited", handler)
  }

  onMessageDeleted(handler: MessageHandler<MessageDeletedPayload>): () => void {
    return this.on("message_deleted", handler)
  }

  onReadReceipt(handler: MessageHandler<ReadReceiptPayload>): () => void {
    return this.on("read_receipt", handler)
  }

  onDeliveryReceipt(handler: MessageHandler<DeliveryReceiptPayload>): () => void {
    return this.on("delivery_receipt", handler)
  }

  onError(handler: MessageHandler<ErrorPayload>): () => void {
    return this.on("error", handler)
  }

  onContactRequest(handler: MessageHandler<ContactRequestPayload>): () => void {
    return this.on("contact_request", handler)
  }

  onContactAccepted(handler: MessageHandler<ContactAcceptedPayload>): () => void {
    return this.on("contact_accepted", handler)
  }

  onContactRemoved(handler: MessageHandler<ContactRemovedPayload>): () => void {
    return this.on("contact_removed", handler)
  }

  onRemovedFromChat(handler: MessageHandler<RemovedFromChatPayload>): () => void {
    return this.on("removed_from_chat", handler)
  }

  onAddedToChat(handler: MessageHandler<AddedToChatPayload>): () => void {
    return this.on("added_to_chat", handler)
  }

  onParticipantsChanged(handler: MessageHandler<ParticipantsChangedPayload>): () => void {
    return this.on("participants_changed", handler)
  }

  onChatSettingsUpdated(handler: MessageHandler<ChatSettingsUpdatedPayload>): () => void {
    return this.on("chat_settings_updated", handler)
  }

  onReactionAdded(handler: MessageHandler<ReactionPayload>): () => void {
    return this.on<ReactionPayload>("reaction_added", handler)
  }

  onReactionRemoved(handler: MessageHandler<ReactionPayload>): () => void {
    return this.on<ReactionPayload>("reaction_removed", handler)
  }

  // Actions to send to server
  subscribe(chatId: string): void {
    this.send({ type: "subscribe", payload: { chatId } })
  }

  unsubscribe(chatId: string): void {
    this.send({ type: "unsubscribe", payload: { chatId } })
  }

  sendTyping(chatId: string): void {
    this.send({ type: "typing", payload: { chatId } })
  }

  sendStopTyping(chatId: string): void {
    this.send({ type: "stop_typing", payload: { chatId } })
  }
}

// Singleton instance
export const wsClient = new WSClient()
