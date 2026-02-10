import type { Message } from "./types"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  currentUserId: string | null
  isGroup?: boolean
  senderName?: string
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function MessageBubble({ message, currentUserId, isGroup, senderName }: MessageBubbleProps) {
  const isSystemMessage = message.senderId === null
  const isMe = message.senderId === currentUserId

  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
      <div className="w-[70%]">
        {isGroup && !isMe && senderName && (
          <p className="mb-0.5 px-3 text-xs font-medium text-primary">
            {senderName}
          </p>
        )}
        <div className={cn("flex items-start gap-1.5", isMe ? "flex-row-reverse" : "flex-row")}>
          <div
            className={cn(
              "relative w-fit max-w-full rounded-2xl px-3 py-1.5 break-words",
              isMe ? "bg-secondary text-secondary-foreground" : "bg-card text-card-foreground"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
