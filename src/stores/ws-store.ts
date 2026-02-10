import { Store } from "@tanstack/react-store"
import { useStore } from "@tanstack/react-store"
import type { ConnectionStatus } from "@/lib/ws-types"

interface WSState {
  status: ConnectionStatus
  subscribedChats: string[]
  typingUsers: Record<string, string[]> // chatId -> userIds currently typing
  onlineUsers: Set<string>
}

export const wsStore = new Store<WSState>({
  status: "disconnected",
  subscribedChats: [],
  typingUsers: {},
  onlineUsers: new Set(),
})

export function useWSStore<T>(selector: (state: WSState) => T): T {
  return useStore(wsStore, selector)
}

// Selectors
export function useConnectionStatus(): ConnectionStatus {
  return useWSStore((state) => state.status)
}

export function useIsConnected(): boolean {
  return useWSStore((state) => state.status === "connected")
}

export function useTypingUsers(chatId: string): string[] {
  return useWSStore((state) => state.typingUsers[chatId] || [])
}

export function useIsUserOnline(userId: string): boolean {
  return useWSStore((state) => state.onlineUsers.has(userId))
}

// Actions
export function setConnectionStatus(status: ConnectionStatus): void {
  wsStore.setState((state) => ({ ...state, status }))
}

export function setSubscribedChats(chatIds: string[]): void {
  wsStore.setState((state) => ({ ...state, subscribedChats: chatIds }))
}

export function addTypingUser(chatId: string, userId: string): void {
  wsStore.setState((state) => {
    const current = state.typingUsers[chatId] || []
    if (current.includes(userId)) return state
    return {
      ...state,
      typingUsers: {
        ...state.typingUsers,
        [chatId]: [...current, userId],
      },
    }
  })
}

export function removeTypingUser(chatId: string, userId: string): void {
  wsStore.setState((state) => {
    const current = state.typingUsers[chatId] || []
    return {
      ...state,
      typingUsers: {
        ...state.typingUsers,
        [chatId]: current.filter((id) => id !== userId),
      },
    }
  })
}

export function clearTypingUser(userId: string): void {
  wsStore.setState((state) => {
    const newTypingUsers: Record<string, string[]> = {}
    let changed = false
    for (const [chatId, users] of Object.entries(state.typingUsers)) {
      const filtered = users.filter((id) => id !== userId)
      if (filtered.length !== users.length) changed = true
      newTypingUsers[chatId] = filtered
    }
    if (!changed) return state
    return { ...state, typingUsers: newTypingUsers }
  })
}

export function setUserOnline(userId: string): void {
  wsStore.setState((state) => {
    const newSet = new Set(state.onlineUsers)
    newSet.add(userId)
    return { ...state, onlineUsers: newSet }
  })
}

export function setUserOffline(userId: string): void {
  wsStore.setState((state) => {
    const newSet = new Set(state.onlineUsers)
    newSet.delete(userId)
    return { ...state, onlineUsers: newSet }
  })
}
