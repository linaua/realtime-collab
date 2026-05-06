import { create } from 'zustand'
import type { Message } from '@/types'

interface MessageStore {
  messages:     Record<string, Message[]>   // roomId → messages
  typingUsers:  Record<string, string[]>    // roomId → usernames
  hasMore:      Record<string, boolean>     // roomId → hasMore
  setMessages:  (roomId: string, msgs: Message[]) => void
  addMessage:   (roomId: string, msg: Message) => void
  updateMessage:(roomId: string, id: string, patch: Partial<Message>) => void
  removeMessage:(roomId: string, id: string) => void
  prependMessages:(roomId: string, msgs: Message[]) => void
  setTyping:    (roomId: string, users: string[]) => void
  setHasMore:   (roomId: string, val: boolean) => void
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages:    {},
  typingUsers: {},
  hasMore:     {},

  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),

  addMessage: (roomId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] || []), msg],
      },
    })),

  updateMessage: (roomId, id, patch) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: (s.messages[roomId] || []).map((m) =>
          m.id === id ? { ...m, ...patch } : m
        ),
      },
    })),

  removeMessage: (roomId, id) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: (s.messages[roomId] || []).map((m) =>
          m.id === id ? { ...m, deleted: true, content: '[deleted]' } : m
        ),
      },
    })),

  prependMessages: (roomId, msgs) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...msgs, ...(s.messages[roomId] || [])],
      },
    })),

  setTyping:  (roomId, users) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [roomId]: users } })),

  setHasMore: (roomId, val) =>
    set((s) => ({ hasMore: { ...s.hasMore, [roomId]: val } })),
}))