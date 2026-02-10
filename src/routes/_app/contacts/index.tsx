import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ContactBookIcon } from "@hugeicons/core-free-icons"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/_app/contacts/")({
  component: ContactsIndexPage,
  head: () => ({
    meta: seo({ title: "Contacts | WhatsApp Clone" }),
  }),
})

function ContactsIndexPage() {
  return (
    <div className="flex h-full items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="mb-4 inline-flex rounded-full bg-muted p-4">
          <HugeiconsIcon
            icon={ContactBookIcon}
            strokeWidth={1.5}
            className="h-8 w-8 text-muted-foreground"
          />
        </div>
        <h2 className="text-lg font-medium">Manage your contacts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a contact to view their details
        </p>
      </div>
    </div>
  )
}
