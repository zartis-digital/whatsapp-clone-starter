import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, ContactIcon } from "@hugeicons/core-free-icons"
import type { Contact, PendingRequest } from "./types"
import { ContactListItem } from "./contact-list-item"
import { ContactRequestItem } from "./contact-request-item"
import { AddContactDialog } from "./add-contact-dialog"

interface ContactsSidebarProps {
  contacts: Contact[]
  pendingRequests: PendingRequest[]
  onAcceptRequest: (id: string) => void
  onRejectRequest: (id: string) => void
  onCancelRequest: (id: string) => void
  onSendRequest: (emailOrUsername: string) => void
}

export function ContactsSidebar({
  contacts,
  pendingRequests,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onSendRequest,
}: ContactsSidebarProps) {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const inboundRequests = pendingRequests.filter((r) => r.direction === "inbound")
  const outboundRequests = pendingRequests.filter((r) => r.direction === "outbound")

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.user.name.toLowerCase().includes(q) ||
      (c.user.username?.toLowerCase().includes(q) ?? false) ||
      c.user.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="flex h-[65px] items-center justify-between border-b border-border px-4">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Button size="icon" variant="ghost" onClick={() => setDialogOpen(true)} title="Add contact">
          <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="contacts" className="flex flex-1 flex-col min-h-0">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="contacts" className="flex-1">Contacts</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 gap-1.5">
            Requests
            {inboundRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5">
                {inboundRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="flex flex-1 flex-col min-h-0 mt-0">
          <div className="px-4 py-3">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredContacts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <HugeiconsIcon
                  icon={ContactIcon}
                  strokeWidth={1.5}
                  className="h-8 w-8 text-muted-foreground"
                />
              </div>
              <h3 className="mb-1 text-sm font-medium">
                {search ? "No matches found" : "No contacts yet"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Add contacts to start chatting"}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              {filteredContacts.map((contact) => (
                <ContactListItem key={contact.id} contact={contact} />
              ))}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="requests" className="flex flex-1 flex-col min-h-0 mt-0">
          <ScrollArea className="flex-1 min-h-0">
            {inboundRequests.length === 0 && outboundRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <h3 className="mb-1 text-sm font-medium">No pending requests</h3>
                <p className="text-xs text-muted-foreground">
                  Contact requests you send or receive will appear here
                </p>
              </div>
            ) : (
              <>
                {inboundRequests.length > 0 && (
                  <div>
                    <h3 className="px-4 pt-3 pb-1 text-xs font-medium uppercase text-muted-foreground">
                      Received
                    </h3>
                    {inboundRequests.map((req) => (
                      <ContactRequestItem
                        key={req.id}
                        request={req}
                        onAccept={onAcceptRequest}
                        onReject={onRejectRequest}
                      />
                    ))}
                  </div>
                )}
                {outboundRequests.length > 0 && (
                  <div>
                    <h3 className="px-4 pt-3 pb-1 text-xs font-medium uppercase text-muted-foreground">
                      Sent
                    </h3>
                    {outboundRequests.map((req) => (
                      <ContactRequestItem
                        key={req.id}
                        request={req}
                        onCancel={onCancelRequest}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AddContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSendRequest={onSendRequest}
      />
    </div>
  )
}
