import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Message01Icon,
  Call02Icon,
  Delete02Icon,
  Mail01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { contactsQueryOptions, useRemoveContact } from "@/queries/contacts"
import { useCreateDirectChat } from "@/queries/chats"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/_app/contacts/$contactId")({
  component: ContactDetailPage,
  head: () => ({
    meta: seo({ title: "Contact | WhatsApp Clone" }),
  }),
})

function ContactDetailPage() {
  const { contactId } = Route.useParams()
  const navigate = useNavigate()

  const { data: contacts } = useSuspenseQuery(contactsQueryOptions)
  const contact = contacts.find((c) => c.id === contactId)
  const createDirectChat = useCreateDirectChat()
  const removeContact = useRemoveContact()

  if (!contact) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    )
  }

  function handleStartChat() {
    createDirectChat.mutate(
      {
        userId: contact!.user.id,
        userName: contact!.user.name,
        userImage: contact!.user.image || undefined,
      },
      {
        onSuccess: (chat) => {
          navigate({ to: "/chats/$chatId", params: { chatId: chat.id } })
        },
        onError: (error) => {
          console.error("Failed to start chat:", error)
          toast.error("Failed to start chat")
        },
      }
    )
  }

  function handleStartCall() {
    toast.info("Calling feature coming soon!")
  }

  function handleDeleteContact() {
    removeContact.mutate(contact!.id, {
      onSuccess: () => {
        toast.success(`${contact!.user.name} removed from contacts`)
        navigate({ to: "/contacts" })
      },
      onError: (error) => {
        console.error("Failed to delete contact:", error)
        toast.error("Failed to remove contact")
      },
    })
  }

  const formattedDate = new Date(contact.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      {/* Banner Section */}
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <Avatar className="h-28 w-28 mb-4 ring-4 ring-background shadow-lg">
          <AvatarImage src={contact.user.image || undefined} alt={contact.user.name} />
          <AvatarFallback className="text-3xl">
            {contact.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-2xl font-semibold text-center">{contact.user.name}</h1>

        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="h-4 w-4" />
          <span className="text-sm">{contact.user.email}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={handleStartChat}
            disabled={createDirectChat.isPending}
            className="gap-2"
          >
            <HugeiconsIcon icon={Message01Icon} strokeWidth={2} className="h-4 w-4" />
            {createDirectChat.isPending ? "Starting..." : "Message"}
          </Button>

          <Button
            variant="outline"
            onClick={handleStartCall}
            className="gap-2"
          >
            <HugeiconsIcon icon={Call02Icon} strokeWidth={2} className="h-4 w-4" />
            Call
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-4 w-4" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {contact.user.name} from your contacts?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteContact}
                  disabled={removeContact.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {removeContact.isPending ? "Removing..." : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact since</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>

          {contact.user.isOnline !== undefined && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className={`h-3 w-3 rounded-full ${contact.user.isOnline ? "bg-green-500" : "bg-muted-foreground"}`} />
              <p className="text-sm">
                {contact.user.isOnline ? "Online" : contact.user.lastSeen ? `Last seen ${new Date(contact.user.lastSeen).toLocaleDateString()}` : "Offline"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
