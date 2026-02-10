import { apiClient } from "@/lib/api-client"

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
  const response = await apiClient.get<Contact[]>("/contacts")
  return response.data
}

// Get pending contact requests (inbound + outbound)
export async function fetchPendingRequests(): Promise<PendingRequest[]> {
  const response = await apiClient.get<PendingRequest[]>("/contacts/pending")
  return response.data
}

// Send a contact request
export async function sendContactRequest(userId: string): Promise<void> {
  await apiClient.post("/contacts", { userId })
}

// Accept a contact request
export async function acceptContactRequest(contactId: string): Promise<void> {
  await apiClient.patch(`/contacts/${contactId}`, { action: "accept" })
}

// Reject a contact request
export async function rejectContactRequest(contactId: string): Promise<void> {
  await apiClient.patch(`/contacts/${contactId}`, { action: "reject" })
}

// Remove a contact
export async function removeContact(contactId: string): Promise<void> {
  await apiClient.delete(`/contacts/${contactId}`)
}
