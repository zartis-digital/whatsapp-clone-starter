import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  LogoutIcon,
  Camera01Icon,
} from "@hugeicons/core-free-icons"
import { useCurrentUser } from "@/stores/app-store"
import { useSession, signOut } from "@/lib/auth-client"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({
    meta: seo({ title: "Settings | WhatsApp Clone" }),
  }),
})

function SettingsPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const currentUser = useCurrentUser()

  // Use session user data if available, fallback to mock user
  const user = session?.user ?? currentUser

  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState(user.username || "")
  const [bio, setBio] = useState(user.bio || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setUsername(session.user.username || "")
      setBio(session.user.bio || "")
    }
  }, [session?.user])

  function handleSave() {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    setTimeout(() => {
      setSaveSuccess(true)
      setIsSaving(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 500)
  }

  async function handleLogout() {
    await signOut()
    navigate({ to: "/sign-in", search: { redirect: undefined } })
  }

  function getInitials(name: string | null | undefined): string {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[65px] items-center border-b border-border bg-card px-6">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="mx-auto max-w-2xl space-y-8 p-6">
          {/* Profile Section */}
          <SettingsSection
            icon={UserIcon}
            title="Profile"
            description="Your personal information"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">Profile Photo</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, and underscores. 3-30 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>
          </SettingsSection>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <HugeiconsIcon
                  icon={LogoutIcon}
                  strokeWidth={2}
                  className="h-5 w-5 text-destructive"
                />
              </div>
              <div>
                <h3 className="font-medium">Logout</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm text-green-600">Changes saved!</p>
            )}
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

interface SettingsSectionProps {
  icon: typeof UserIcon
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <HugeiconsIcon icon={icon} strokeWidth={2} className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 pl-[52px]">{children}</div>
    </div>
  )
}
