import { createFileRoute } from "@tanstack/react-router"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Archive02Icon } from "@hugeicons/core-free-icons"
import { useArchivedChats, unarchiveChat } from "@/stores/app-store"
import { toast } from "sonner"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/_app/archive")({
  component: ArchivePage,
  head: () => ({
    meta: seo({ title: "Archive | WhatsApp Clone" }),
  }),
})

function ArchivePage() {
  const archivedChats = useArchivedChats()

  function handleUnarchive(chatId: string) {
    unarchiveChat(chatId)
    toast("Chat unarchived")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[65px] items-center border-b border-border bg-card px-6">
        <div>
          <h1 className="text-xl font-semibold">Archive</h1>
          <p className="text-sm text-muted-foreground">
            {archivedChats.length} archived {archivedChats.length === 1 ? "chat" : "chats"}
          </p>
        </div>
      </div>

      {archivedChats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <HugeiconsIcon
              icon={Archive02Icon}
              strokeWidth={1.5}
              className="h-8 w-8 text-muted-foreground"
            />
          </div>
          <h3 className="mb-1 text-sm font-medium">No archived chats</h3>
          <p className="text-xs text-muted-foreground">
            Chats you archive will appear here
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="divide-y divide-border">
            {archivedChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 px-6 py-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>
                    {chat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium">{chat.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.lastMessage}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnarchive(chat.id)}
                >
                  Unarchive
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
