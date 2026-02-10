import { useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon } from "@hugeicons/core-free-icons"
import type { Contact } from "./types"

interface ContactDetailProps {
  contact: Contact
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const navigate = useNavigate()
  const { user } = contact

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-muted/30 px-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-muted bg-green-500" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={`h-2 w-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`}
          />
          {user.isOnline ? "Online" : "Offline"}
        </div>

        <p className="text-xs text-muted-foreground">
          Contact since {new Date(contact.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <Button
          onClick={() => navigate({ to: "/chats" })}
          className="gap-2"
        >
          <HugeiconsIcon icon={Message01Icon} strokeWidth={2} className="h-4 w-4" />
          Send Message
        </Button>
      </div>
    </div>
  )
}
