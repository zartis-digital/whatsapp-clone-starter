export interface ContactUser {
  id: string
  name: string
  email: string
  image: string | null
  username?: string
  isOnline: boolean
  lastSeen: string
}

export interface Contact {
  id: string
  user: ContactUser
  createdAt: string
}

export interface PendingRequest {
  id: string
  direction: "inbound" | "outbound"
  from?: ContactUser
  to?: ContactUser
  createdAt: string
}
