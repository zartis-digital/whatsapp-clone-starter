import { useSuspenseQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

export const currentUserQueryOptions = {
  queryKey: ["current-user"],
  queryFn: async () => {
    const session = await authClient.getSession()
    return session.data?.user ?? null
  },
  staleTime: Infinity,
}

export function useCurrentUserId(): string | null {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions)
  return user?.id ?? null
}

export function useCurrentUser() {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions)
  return user
}
