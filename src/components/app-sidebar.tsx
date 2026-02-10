import { Link, useLocation } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon, Settings01Icon, ContactBookIcon, Archive02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/chats", icon: Message01Icon, label: "Chats" },
  { to: "/contacts", icon: ContactBookIcon, label: "Contacts" },
  { to: "/archive", icon: Archive02Icon, label: "Archive" },
] as const

export function AppSidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-full w-16 flex-col border-r border-border bg-card">
      <nav className="flex flex-1 flex-col items-center gap-1 py-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname.startsWith(item.to)}
          />
        ))}
      </nav>
      <nav className="flex flex-col items-center gap-1 border-t border-border py-4">
        <SidebarItem
          to="/settings"
          icon={Settings01Icon}
          label="Settings"
          isActive={location.pathname.startsWith("/settings")}
        />
      </nav>
    </aside>
  )
}

interface SidebarItemProps {
  to: string
  icon: typeof Message01Icon
  label: string
  isActive: boolean
}

function SidebarItem({ to, icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      title={label}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="h-5 w-5" />
    </Link>
  )
}
