import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        username: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
        isOnline: {
          type: "boolean",
          required: false,
        },
        lastSeen: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
