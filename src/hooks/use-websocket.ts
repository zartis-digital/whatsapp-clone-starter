import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wsClient } from "@/lib/ws-client";
import type { Chat, Message } from "@/components/chat/types";
import type { InfiniteData } from "@tanstack/react-query";
import {
  setConnectionStatus,
  setSubscribedChats,
  addTypingUser,
  removeTypingUser,
  setUserOnline,
  setUserOffline,
  clearTypingUser,
} from "@/stores/ws-store";
import {
  chatsQueryOptions,
  chatDetailsQueryOptions,
  messagesQueryOptions,
} from "@/queries/chats";
import {
  contactsQueryOptions,
  pendingRequestsQueryOptions,
} from "@/queries/contacts";
import { currentUserQueryOptions } from "@/hooks/use-current-user";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";

// Following TkDodo's pattern: https://tkdodo.eu/blog/using-web-sockets-with-react-query
export function useWebSocketConnection(): void {
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Connect to WebSocket (cookies are sent automatically)
    wsClient.connect({
      url: WS_URL,
      onStatusChange: setConnectionStatus,
    });

    // Set up event handlers
    const unsubscribers = [
      // Connection events — Fix 3: invalidate on reconnect
      wsClient.onPresence((payload) => {
        setSubscribedChats(payload.subscribedChats);

        if (hasConnectedOnce.current) {
          // Reconnect: invalidate stale caches
          queryClient.invalidateQueries({
            queryKey: chatsQueryOptions.queryKey,
          });
          // Prefix-based: invalidates all ["messages", *] caches
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        } else {
          hasConnectedOnce.current = true;
        }
      }),

      wsClient.onError((payload) => {
        console.error("WebSocket error:", payload.message);
      }),

      // Typing indicators (keep in store - ephemeral state)
      wsClient.onTyping((payload) => {
        if (payload.userId) {
          addTypingUser(payload.chatId, payload.userId);
        }
      }),

      wsClient.onStopTyping((payload) => {
        if (payload.userId) {
          removeTypingUser(payload.chatId, payload.userId);
        }
      }),

      // User presence (keep in store - ephemeral state)
      wsClient.onUserOnline((payload) => {
        setUserOnline(payload.userId);
        // Update chat online status in Query cache
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) =>
            oldChats?.map((chat) =>
              chat.type === "direct" && chat.otherUserId === payload.userId
                ? { ...chat, otherUserOnline: true }
                : chat,
            ),
        );
      }),

      wsClient.onUserOffline((payload) => {
        setUserOffline(payload.userId);
        // Fix 8: Clear typing indicators on user disconnect
        clearTypingUser(payload.userId);
        // Update chat online status in Query cache
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) =>
            oldChats?.map((chat) =>
              chat.type === "direct" && chat.otherUserId === payload.userId
                ? { ...chat, otherUserOnline: false }
                : chat,
            ),
        );
      }),

      // Messages - update Query cache directly
      wsClient.onMessage((payload) => {
        const message: Message = {
          id: payload.id,
          chatId: payload.chatId,
          senderId: payload.senderId,
          type: payload.type,
          content: payload.content,
          replyToId: payload.replyToId,
          forwardedFromId: payload.forwardedFromId,
          editedAt: payload.editedAt,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
          deletedAt: payload.deletedAt,
        };

        // Add message to the messages cache (only if cache exists)
        // If no cache exists, DON'T initialize - the route loader will fetch
        // full history when user navigates to the chat
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor: string | null }>
        >(messagesQueryOptions(payload.chatId).queryKey, (oldData) => {
          // If no cache exists, return undefined to let the route loader
          // fetch the full history when user navigates to this chat
          if (!oldData) {
            return undefined;
          }

          // Check for duplicates in the first page (most recent)
          const firstPage = oldData.pages[0];
          if (firstPage?.items.some((m) => m.id === message.id)) {
            return oldData;
          }

          // Check for an optimistic (temp-*) message to replace
          const tempIdx = firstPage?.items.findIndex(
            (m) =>
              m.id.startsWith("temp-") &&
              m.senderId === message.senderId &&
              m.content === message.content,
          );
          if (tempIdx !== undefined && tempIdx >= 0) {
            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  items: firstPage.items.map((m, i) =>
                    i === tempIdx ? message : m,
                  ),
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          // Add to the first page (messages are in reverse chronological order in API)
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                items: [message, ...firstPage.items],
              },
              ...oldData.pages.slice(1),
            ],
          };
        });

        // Update chat's last message in the chats cache
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) => {
            if (!oldChats) return oldChats;

            // Get current user to check if this is our own message
            const currentUser = queryClient.getQueryData<{ id: string } | null>(
              currentUserQueryOptions.queryKey,
            );
            const isOwnMessage = currentUser?.id === payload.senderId;

            const updatedChats = oldChats.map((chat) =>
              chat.id === payload.chatId
                ? {
                    ...chat,
                    lastMessage: message.content,
                    lastMessageAt: message.createdAt,
                    // Only increment unread if it's not our own message
                    unreadCount: isOwnMessage
                      ? chat.unreadCount
                      : chat.unreadCount + 1,
                  }
                : chat,
            );

            // Sort chats by last message time
            return updatedChats.sort((a, b) => {
              const aTime = a.lastMessageAt
                ? new Date(a.lastMessageAt).getTime()
                : 0;
              const bTime = b.lastMessageAt
                ? new Date(b.lastMessageAt).getTime()
                : 0;
              return bTime - aTime;
            });
          },
        );

        // Clear typing indicator for this user
        if (payload.senderId) {
          removeTypingUser(payload.chatId, payload.senderId);
        }
      }),

      wsClient.onMessageEdited((payload) => {
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor: string | null }>
        >(messagesQueryOptions(payload.chatId).queryKey, (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) =>
                msg.id === payload.id
                  ? {
                      ...msg,
                      content: payload.content,
                      editedAt: payload.editedAt,
                      updatedAt: payload.updatedAt,
                    }
                  : msg,
              ),
            })),
          };
        });

        // Fix 9: Update chat list's lastMessage if the edited message is the most recent
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) =>
            oldChats?.map((c) =>
              c.id === payload.chatId
                ? { ...c, lastMessage: payload.content }
                : c,
            ),
        );
      }),

      wsClient.onMessageDeleted((payload) => {
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor: string | null }>
        >(messagesQueryOptions(payload.chatId).queryKey, (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) =>
                msg.id === payload.messageId
                  ? { ...msg, deletedAt: new Date().toISOString() }
                  : msg,
              ),
            })),
          };
        });

        // Fix 9: Invalidate chats since deleted message may have been the last message
        queryClient.invalidateQueries({ queryKey: chatsQueryOptions.queryKey });
      }),

      // Fix 2 + Fix 6: Handle read receipts — reset unreadCount on multi-device read
      wsClient.onReadReceipt((payload) => {
        const currentUser = queryClient.getQueryData<{ id: string } | null>(
          currentUserQueryOptions.queryKey,
        );
        if (currentUser?.id === payload.userId) {
          // Current user read messages on another device — clear unread count
          queryClient.setQueryData<Chat[]>(chatsQueryOptions.queryKey, (old) =>
            old?.map((c) =>
              c.id === payload.chatId ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      }),

      // Fix 2: Handle delivery receipts
      wsClient.onDeliveryReceipt((payload) => {
        console.debug("Delivery receipt:", payload);
      }),

      // Fix 4: Handle participants changed
      wsClient.onParticipantsChanged((payload) => {
        queryClient.invalidateQueries({
          queryKey: chatDetailsQueryOptions(payload.chatId).queryKey,
        });
      }),

      // Fix 7: Handle chat settings updated (multi-device sync)
      wsClient.onChatSettingsUpdated(() => {
        queryClient.invalidateQueries({ queryKey: chatsQueryOptions.queryKey });
      }),

      // Contact events - invalidate queries to refetch
      wsClient.onContactRequest((payload) => {
        queryClient.invalidateQueries({
          queryKey: pendingRequestsQueryOptions.queryKey,
        });
        toast.info(`${payload.from.name} sent you a contact request`);
      }),

      wsClient.onContactAccepted((payload) => {
        queryClient.invalidateQueries({
          queryKey: contactsQueryOptions.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: pendingRequestsQueryOptions.queryKey,
        });
        queryClient.invalidateQueries({ queryKey: chatsQueryOptions.queryKey });
        toast.success(`${payload.user.name} accepted your contact request`);
      }),

      // Contact removed — hide the direct chat (same pattern as onRemovedFromChat)
      wsClient.onContactRemoved((payload) => {
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) => oldChats?.filter((chat) => chat.id !== payload.chatId),
        );
        queryClient.removeQueries({
          queryKey: chatDetailsQueryOptions(payload.chatId).queryKey,
        });
        queryClient.removeQueries({
          queryKey: messagesQueryOptions(payload.chatId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: contactsQueryOptions.queryKey,
        });

        toast.info(`${payload.contactName} removed you as a contact`);
      }),

      // Group chat events
      wsClient.onRemovedFromChat((payload) => {
        // Remove the chat from the cache
        queryClient.setQueryData<Chat[]>(
          chatsQueryOptions.queryKey,
          (oldChats) => oldChats?.filter((chat) => chat.id !== payload.chatId),
        );
        // Invalidate chat details
        queryClient.removeQueries({
          queryKey: chatDetailsQueryOptions(payload.chatId).queryKey,
        });
        queryClient.removeQueries({
          queryKey: messagesQueryOptions(payload.chatId).queryKey,
        });

        // Show notification
        if (payload.removedBy) {
          toast.info(`You were removed from "${payload.chatName}"`);
        }
      }),

      wsClient.onAddedToChat((payload) => {
        // Fix 1: Subscribe to the new chat's WS room
        wsClient.subscribe(payload.chatId);
        // Refetch chats list to include the new chat
        queryClient.invalidateQueries({ queryKey: chatsQueryOptions.queryKey });
        toast.info("You were added to a group");
      }),

      // Reactions
      wsClient.onReactionAdded((payload) => {
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor: string | null }>
        >(messagesQueryOptions(payload.chatId).queryKey, (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) => {
                if (msg.id !== payload.messageId) return msg;

                const reactions = msg.reactions || [];
                const existingReactionIndex = reactions.findIndex(
                  (r) => r.emoji === payload.emoji,
                );

                if (existingReactionIndex >= 0) {
                  // Update existing reaction
                  const existingReaction = reactions[existingReactionIndex];
                  const userExists = existingReaction.users.some(
                    (u) => u.id === payload.userId,
                  );

                  if (userExists) return msg; // User already reacted with this emoji

                  const updatedReactions = [...reactions];
                  updatedReactions[existingReactionIndex] = {
                    ...existingReaction,
                    count: existingReaction.count + 1,
                    users: [...existingReaction.users, payload.user],
                  };

                  return { ...msg, reactions: updatedReactions };
                } else {
                  // Add new reaction
                  return {
                    ...msg,
                    reactions: [
                      ...reactions,
                      {
                        emoji: payload.emoji,
                        count: 1,
                        users: [payload.user],
                      },
                    ],
                  };
                }
              }),
            })),
          };
        });
      }),

      wsClient.onReactionRemoved((payload) => {
        queryClient.setQueryData<
          InfiniteData<{ items: Message[]; nextCursor: string | null }>
        >(messagesQueryOptions(payload.chatId).queryKey, (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) => {
                if (msg.id !== payload.messageId) return msg;

                const reactions = msg.reactions || [];
                const existingReactionIndex = reactions.findIndex(
                  (r) => r.emoji === payload.emoji,
                );

                if (existingReactionIndex < 0) return msg;

                const existingReaction = reactions[existingReactionIndex];
                const updatedUsers = existingReaction.users.filter(
                  (u) => u.id !== payload.userId,
                );

                if (updatedUsers.length === 0) {
                  // Remove reaction entry if no users left
                  return {
                    ...msg,
                    reactions: reactions.filter(
                      (r) => r.emoji !== payload.emoji,
                    ),
                  };
                } else {
                  // Update reaction with remaining users
                  const updatedReactions = [...reactions];
                  updatedReactions[existingReactionIndex] = {
                    ...existingReaction,
                    count: updatedUsers.length,
                    users: updatedUsers,
                  };

                  return { ...msg, reactions: updatedReactions };
                }
              }),
            })),
          };
        });
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      wsClient.disconnect();
      initialized.current = false;
    };
  }, [queryClient]);
}

// Hook for sending typing indicators with debounce
export function useTypingIndicator(chatId: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isTypingRef = useRef(false);

  const startTyping = () => {
    // Only send if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      wsClient.sendTyping(chatId);
    }

    // Reset the stop timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      wsClient.sendStopTyping(chatId);
    }, 3000);
  };

  const stopTyping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      wsClient.sendStopTyping(chatId);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { startTyping, stopTyping };
}

// Re-export selectors for convenience
export { useTypingUsers } from "@/stores/ws-store";
