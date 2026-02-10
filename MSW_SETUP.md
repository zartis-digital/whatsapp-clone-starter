# MSW Mock Setup

This frontend starter now has a complete Mock Service Worker (MSW) setup that allows the app to work without a backend.

## What was installed

1. **MSW package**: `pnpm add -D msw@2.12.9`
2. **Service worker**: `public/mockServiceWorker.js` (copied from node_modules)
3. **Mock data**: `src/mocks/data.ts` - Contains mock users, contacts, chats, and messages
4. **Mock handlers**: `src/mocks/handlers.ts` - MSW request handlers for all API endpoints
5. **Worker setup**: `src/mocks/browser.ts` - MSW worker configuration
6. **Environment variable**: `VITE_MOCK_API=true` in `.env`

## Mock Data Overview

The mock layer includes:

- **Mock User**: "Workshop User" (user-1) - the authenticated user
- **Mock Contacts**: 3 contacts (Alice Johnson, Bob Smith, Carol Davis)
- **Mock Chat**: 1 direct chat with Alice Johnson
- **Mock Messages**: 3 initial messages in the chat with Alice
- **Mock Session**: Valid session for better-auth

## API Endpoints Mocked

### Authentication
- `GET /api/auth/get-session` - Returns mock session and user

### Chats
- `GET /chats` - List all chats
- `GET /chats/:chatId` - Get chat details
- `POST /chats` - Create new chat
- `PATCH /chats/:chatId` - Update chat details
- `DELETE /chats/:chatId` - Leave/delete chat
- `POST /chats/:chatId/read` - Mark chat as read
- `PATCH /chats/:chatId/settings` - Update pin/archive/mute settings

### Messages
- `GET /chats/:chatId/messages` - Get messages (with pagination support)
- `POST /chats/:chatId/messages` - Send message
- `PATCH /chats/:chatId/messages/:messageId` - Edit message
- `DELETE /chats/:chatId/messages/:messageId` - Delete message (soft delete)
- `POST /chats/:chatId/messages/:messageId/forward` - Forward message
- `POST /chats/:chatId/messages/delivered` - Mark as delivered

### Reactions
- `POST /chats/:chatId/messages/:messageId/reactions` - Toggle reaction
- `GET /chats/:chatId/messages/:messageId/reactions` - Get reactions

### Contacts
- `GET /contacts` - Get all contacts
- `GET /contacts/pending` - Get pending requests
- `POST /contacts` - Send contact request
- `PATCH /contacts/:contactId` - Accept/reject contact request
- `DELETE /contacts/:contactId` - Remove contact

### Group Chats
- `POST /chats/:chatId/participants` - Add participants
- `DELETE /chats/:chatId/participants/:userId` - Remove participant

### Files
- `GET /files/url?key=...` - Get presigned URL for file
- `GET /files/media` - Get all media messages

## How to Use

1. **Start the app**: `pnpm dev`
2. The MSW worker will start automatically when `VITE_MOCK_API=true`
3. Check the browser console for: `[MSW] Mocking enabled.`
4. All API calls will be intercepted and return mock data

## Switching Between Mock and Real Backend

Edit `.env`:

```bash
# Use mock backend
VITE_MOCK_API=true

# Use real backend
VITE_MOCK_API=false
```

## Adding New Mock Data

### Add a new contact
Edit `src/mocks/data.ts` and add to `mockContacts` array:

```typescript
{
  id: "contact-4",
  user: {
    id: "user-5",
    name: "New User",
    email: "newuser@example.com",
    image: null,
    username: "new_user",
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
}
```

### Add a new chat
Add to `mockChats` array in `src/mocks/data.ts`:

```typescript
{
  chat: {
    id: "chat-2",
    type: "direct" as const,
    name: null,
    description: null,
    avatarUrl: null,
    lastMessageId: null,
    lastMessageAt: null,
    createdBy: mockUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  participant: {
    id: "participant-2",
    chatId: "chat-2",
    userId: mockUser.id,
    isAdmin: false,
    isMuted: false,
    mutedUntil: null,
    archivedAt: null,
    pinnedAt: null,
    joinedAt: new Date().toISOString(),
    leftAt: null,
  },
  lastMessage: null,
  otherUser: {
    id: "user-3",
    name: "Bob Smith",
    image: null,
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
  unreadCount: 0,
}
```

### Add messages to a chat
Add to `mockMessages` object in `src/mocks/data.ts`:

```typescript
"chat-2": [
  {
    id: "msg-10",
    chatId: "chat-2",
    senderId: mockUser.id,
    type: "text",
    content: "Hello Bob!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
```

## Adding New API Endpoints

Edit `src/mocks/handlers.ts` and add a new handler:

```typescript
http.get('*/your/endpoint', () => {
  return HttpResponse.json({ data: "your mock data" })
}),
```

## Features

- **Auto-incrementing IDs**: Use `nextMessageId()`, `nextChatId()`, `nextParticipantId()`
- **Stateful mocks**: Messages and chats persist in memory during the session
- **Reactions**: Full support for adding/removing reactions
- **Message editing**: Edit messages with `editedAt` timestamp
- **Soft delete**: Messages are marked with `deletedAt` instead of being removed
- **Pagination ready**: Messages endpoint supports cursor-based pagination
- **Type-safe**: All handlers use proper TypeScript types matching the API

## Notes

- Mock data is stored in memory and resets on page refresh
- WebSocket events are NOT mocked (WebSocket needs separate handling)
- File uploads return mock presigned URLs
- All timestamps are generated dynamically for realistic data
