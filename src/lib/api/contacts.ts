import type { Chat } from "@/components/chat/types"

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  isOnline?: boolean
  lastSeen?: string | null
}

export interface Contact {
  id: string
  user: User
  createdAt: string
}

export interface InboundRequest {
  id: string
  direction: "inbound"
  from: User
  createdAt: string
}

export interface OutboundRequest {
  id: string
  direction: "outbound"
  to: User
  createdAt: string
}

export type PendingRequest = InboundRequest | OutboundRequest

// Get accepted contacts
export async function fetchContacts(): Promise<Contact[]> {
  // TODO: replace with real API call
  const { mockContacts } = await import("@/lib/data")
  return mockContacts
}

// Get pending contact requests (inbound + outbound)
export async function fetchPendingRequests(): Promise<PendingRequest[]> {
  // TODO: replace with real API call
  const { mockPendingRequests } = await import("@/lib/data")
  return mockPendingRequests
}

// Send a contact request
export async function sendContactRequest(_userId: string): Promise<void> {
  // TODO: replace with real API call
}

// Accept a contact request
export async function acceptContactRequest(_contactId: string): Promise<void> {
  // TODO: replace with real API call
}

// Reject a contact request
export async function rejectContactRequest(_contactId: string): Promise<void> {
  // TODO: replace with real API call
}

// Remove a contact
export async function removeContact(_contactId: string): Promise<void> {
  // TODO: replace with real API call
}
