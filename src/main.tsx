import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"

import "./index.css"

// Create QueryClient with default options
// Following TkDodo's WebSocket pattern: https://tkdodo.eu/blog/using-web-sockets-with-react-query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // WebSocket handles freshness via invalidation
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // WebSocket handles updates
      refetchOnReconnect: false, // WebSocket will invalidate when needed
    },
  },
})

// Create router with QueryClient in context
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0, // Let Query handle staleness
})

// Register router types
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
