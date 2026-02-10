import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { authClient } from "@/lib/auth-client"
import { useWebSocketConnection } from "@/hooks/use-websocket"

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  useWebSocketConnection()

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
