import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import * as contactsApi from "@/lib/api/contacts"

export const contactsQueryOptions = queryOptions({
  queryKey: ["contacts"],
  queryFn: contactsApi.fetchContacts,
})

export const pendingRequestsQueryOptions = queryOptions({
  queryKey: ["pending-requests"],
  queryFn: contactsApi.fetchPendingRequests,
})

// Mutations

export function useAcceptContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactsApi.acceptContactRequest(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useRejectContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactsApi.rejectContactRequest(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryOptions.queryKey })
    },
  })
}

export function useCancelContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactsApi.removeContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryOptions.queryKey })
    },
  })
}

export function useRemoveContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactsApi.removeContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useSendContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (identifier: string) => contactsApi.sendContactRequest(identifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingRequestsQueryOptions.queryKey })
    },
  })
}
