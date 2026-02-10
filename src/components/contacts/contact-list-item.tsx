import { Link, useParams } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Contact } from "./types"

interface ContactListItemProps {
  contact: Contact
}

export function ContactListItem({ contact }: ContactListItemProps) {
  const params = useParams({ strict: false })
  const isActive = params.contactId === contact.id
  const { user } = contact

  return (
    <Link
      to="/contacts/$contactId"
      params={{ contactId: contact.id }}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <span className="font-medium">{user.name}</span>
        {user.username && (
          <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
        )}
      </div>
    </Link>
  )
}
