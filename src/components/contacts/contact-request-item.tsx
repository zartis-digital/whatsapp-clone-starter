import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { PendingRequest } from "./types"

interface ContactRequestItemProps {
  request: PendingRequest
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onCancel?: (id: string) => void
}

export function ContactRequestItem({
  request,
  onAccept,
  onReject,
  onCancel,
}: ContactRequestItemProps) {
  const user = request.direction === "inbound" ? request.from : request.to
  if (!user) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3">
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
      <div className="flex-1 overflow-hidden">
        <span className="font-medium">{user.name}</span>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      </div>
      <div className="flex gap-1.5">
        {request.direction === "inbound" ? (
          <>
            <Button size="sm" onClick={() => onAccept?.(request.id)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReject?.(request.id)}>
              Reject
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onCancel?.(request.id)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
