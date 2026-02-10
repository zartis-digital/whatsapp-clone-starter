# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start Vite dev server on http://localhost:5173
- `pnpm build` — type-check (`tsc -b`) then production build
- `pnpm lint` — run ESLint
- `pnpm preview` — preview production build

## Package Manager

Always use **pnpm** (not npm or yarn).

## Environment

Copy `.env.example` to `.env`. Key variables:
- `VITE_API_BASE_URL` — backend API (default `http://localhost:3000`)
- `VITE_WS_URL` — WebSocket endpoint (default `ws://localhost:3000/ws`)
- `VITE_MOCK_API` — set `true` for offline development with MSW

## Architecture

React 19 SPA (Vite 7, TypeScript 5.9, Tailwind CSS v4) — a WhatsApp-style chat app.

### Routing — TanStack Router (file-based)

Routes live in `src/routes/`. The route tree is auto-generated into `src/routeTree.gen.ts` (do not edit).

Two layout groups:
- **`_app`** — authenticated routes (chats, contacts, settings, archive). The `_app.tsx` layout guard checks the session via `authClient.getSession()` and redirects to `/sign-in` if unauthenticated.
- **`_auth`** — public auth routes (`/sign-in`, `/sign-up`).

### State Management — dual-layer pattern

1. **Server state** — TanStack Query. Query option factories in `src/queries/` (e.g. `chatsQueryOptions`, `messagesQueryOptions`). API functions in `src/lib/api/`. The QueryClient uses `staleTime: Infinity` because WebSocket handles freshness.
2. **Ephemeral client state** — TanStack Store (`src/stores/`).
   - `app-store.tsx` — chats, messages, contacts (used in mock/offline mode with local data from `src/lib/data.ts`).
   - `ws-store.ts` — connection status, typing indicators, online presence.

### Real-time — WebSocket

- `src/lib/ws-client.ts` — singleton `WSClient` using ReconnectingWebSocket with typed event helpers and message queuing.
- `src/lib/ws-types.ts` — all WS message/payload type definitions.
- `src/hooks/use-websocket.ts` — `useWebSocketConnection()` hook wires WS events to TanStack Query cache updates (follows TkDodo's pattern). Also provides `useTypingIndicator()`.

### Auth — better-auth

Client configured in `src/lib/auth-client.ts` with `inferAdditionalFields` plugin (username, bio, isOnline, lastSeen). Exports `authClient`, `signIn`, `signUp`, `signOut`, `useSession`.

### HTTP — Axios

`src/lib/api-client.ts` — single Axios instance with `withCredentials: true` for cookie-based auth.

### Backend API Reference

Swagger UI: https://backend-production-12809.up.railway.app/swagger (OpenAPI spec at `/doc`).

Before adding or modifying any API call, fetch the swagger docs to verify the correct endpoint path and request body schema.

### UI Components

- `src/components/ui/` — shadcn/ui primitives (Radix + Tailwind). Do not modify these directly; use `shadcn` CLI to add/update.
- `src/components/chat/` — chat UI (sidebar, panel, message bubbles, list items). Types in `src/components/chat/types.ts`.
- `src/components/contacts/` — contacts UI. Types in `src/components/contacts/types.ts`.

### Path Alias

`@/` maps to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`).

### TypeScript

Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly`.
