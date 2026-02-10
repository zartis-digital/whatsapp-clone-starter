import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { useChats } from "@/stores/app-store"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export const Route = createFileRoute("/_app/chats")({
  component: ChatsLayout,
})

function ChatsLayout() {
  const chats = useChats()

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel id="sidebar" defaultSize="320px" minSize="200px" maxSize="400px">
        <ChatSidebar chats={chats} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="content" minSize="50%">
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
