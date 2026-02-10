import { createPortal } from "react-dom"
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "@/components/ui/sonner"
import { seo } from "@/lib/seo"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "WhatsApp Clone",
        description:
          "A WhatsApp clone built with React and TanStack Router",
      }),
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      {createPortal(<HeadContent />, document.head)}
      <Outlet />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
