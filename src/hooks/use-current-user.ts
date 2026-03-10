import { mockUser } from "@/lib/data"

export const currentUserQueryOptions = {
  queryKey: ["current-user"],
  queryFn: async () => mockUser,
  staleTime: Infinity,
}

export function useCurrentUserId(): string {
  return mockUser.id
}

export function useCurrentUser() {
  return mockUser
}
