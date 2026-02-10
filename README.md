# WhatsApp Clone — Frontend Starter

A real-time chat application frontend built for the **Claude Code Labs** workshop. It provides a fully scaffolded React SPA with mock data so participants can explore the UI and progressively connect it to a real backend.

## Tech Stack

- **React 19** + **TypeScript 5.9** (Vite 7)
- **TanStack Router** — file-based routing with auth guards
- **TanStack Query** — server state with suspense and loader pre-fetching
- **TanStack Store** — lightweight client-side state (typing indicators, presence)
- **shadcn/ui** (Radix + Tailwind CSS v4) — component library
- **better-auth** — authentication (email/password + Google OAuth)
- **Axios** — HTTP client with cookie-based auth
- **ReconnectingWebSocket** — real-time messaging
- **MSW** — mock service worker for offline development

## Features

- Sign in / sign up (email + Google OAuth)
- Chat list with unread counts and last message preview
- 1:1 direct messaging with real-time delivery via WebSocket
- Typing indicators and online/offline presence
- Message reactions, replies, edits, and deletions
- File uploads (images, video, audio, documents)
- Resizable sidebar panel
- Dark mode support

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v9 or later)

## Getting Started

```bash
pnpm install
cp .env.example .env   # configure API and WS URLs
pnpm dev               # starts Vite on http://localhost:5173
```

### Mock Mode (MSW)

The app ships with MSW handlers and mock data so the UI works out of the box without a backend. See `MSW_SETUP.md` for details.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (default `http://localhost:3000`) |
| `VITE_WS_URL` | WebSocket endpoint (default `ws://localhost:3000/ws`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

## Project Structure

```
src/
├── components/
│   ├── chat/          # Chat UI (sidebar, panel, message bubble, list item)
│   └── ui/            # shadcn/ui primitives
├── hooks/             # Custom hooks (current user, websocket, scroll, etc.)
├── lib/
│   ├── api/           # API modules per resource (chats, contacts, users)
│   ├── api-client.ts  # Axios instance
│   ├── auth-client.ts # better-auth client
│   ├── ws-client.ts   # WebSocket client
│   └── ws-types.ts    # WS message type definitions
├── mocks/             # MSW handlers + mock data
├── queries/           # TanStack Query option factories
├── routes/            # TanStack Router file-based routes
├── stores/            # TanStack Store (ephemeral client state)
└── main.tsx           # App entry point
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (port 5173) |
| `pnpm build` | Type-check + production build |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |
