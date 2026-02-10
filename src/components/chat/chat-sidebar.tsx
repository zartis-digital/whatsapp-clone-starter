import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageMultiple02Icon, Message01Icon } from "@hugeicons/core-free-icons"
import { contactsQueryOptions } from "@/queries/contacts"
import { useCreateDirectChat } from "@/queries/chats"
import type { Chat } from "./types"
import { ChatListItem } from "./chat-list-item"

interface ChatSidebarProps {
  chats: Chat[]
}

export function ChatSidebar({ chats }: ChatSidebarProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { data: contacts } = useQuery(contactsQueryOptions)
  const createChat = useCreateDirectChat()

  const filteredContacts = useMemo(() => {
    if (!contacts) return []
    const query = search.toLowerCase()
    return contacts.filter((c) => c.user.name.toLowerCase().includes(query))
  }, [contacts, search])

  async function handleSelectContact(contact: (typeof filteredContacts)[number]) {
    const chat = await createChat.mutateAsync({
      userId: contact.user.id,
      userName: contact.user.name,
      userImage: contact.user.image ?? undefined,
    })
    setOpen(false)
    setSearch("")
    navigate({ to: "/chats/$chatId", params: { chatId: chat.id } })
  }

  const activeChats = chats
    .filter((chat) => !chat.archivedAt)
    .sort((a, b) => {
      // Pinned chats first
      if (a.pinnedAt && !b.pinnedAt) return -1
      if (!a.pinnedAt && b.pinnedAt) return 1
      if (a.pinnedAt && b.pinnedAt) {
        return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime()
      }
      // Then by last message time
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bTime - aTime
    })

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="flex h-[65px] items-center justify-between border-b border-border px-4">
        <h1 className="text-xl font-semibold">Chats</h1>
        <Popover open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setSearch("") }}>
          <PopoverTrigger asChild>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <HugeiconsIcon icon={Message01Icon} strokeWidth={1.5} className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="p-2">
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="max-h-64 overflow-hidden">
              {filteredContacts.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No contacts found
                </p>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    disabled={createChat.isPending}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Avatar size="sm">
                      {contact.user.image && <AvatarImage src={contact.user.image} alt={contact.user.name} />}
                      <AvatarFallback>{contact.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{contact.user.name}</span>
                  </button>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      {activeChats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <HugeiconsIcon
              icon={MessageMultiple02Icon}
              strokeWidth={1.5}
              className="h-8 w-8 text-muted-foreground"
            />
          </div>
          <h3 className="mb-1 text-sm font-medium">No chats yet</h3>
          <p className="text-xs text-muted-foreground">
            Start a conversation with one of your contacts
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          {activeChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </ScrollArea>
      )}
    </div>
  )
}
