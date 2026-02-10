import { Link, useParams } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Pin02Icon,
} from "@hugeicons/core-free-icons"
import type { Chat } from "./types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatListItemProps {
  chat: Chat
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (days === 1) {
    return "Yesterday"
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" })
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const params = useParams({ strict: false })
  const isActive = params.chatId === chat.id

  return (
    <Link
      to="/chats/$chatId"
      params={{ chatId: chat.id }}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>
            {chat.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        {chat.type === "group" && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            {chat.name}
            {chat.pinnedAt && (
              <HugeiconsIcon
                icon={Pin02Icon}
                strokeWidth={2}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(chat.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-muted-foreground">
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
