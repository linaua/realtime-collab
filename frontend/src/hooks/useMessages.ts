import { useEffect, useCallback, useState } from 'react'
import { messagesApi } from '@/lib/api'
import { useMessageStore } from '@/store/messageStore'

export function useMessages(roomId: string | null) {
  const { messages, typingUsers, hasMore, setMessages, prependMessages, setHasMore } =
    useMessageStore()
  const [loading, setLoading] = useState(false)

  const roomMessages = roomId ? (messages[roomId] || []) : []
  const roomTyping   = roomId ? (typingUsers[roomId] || []) : []
  const canLoadMore  = roomId ? (hasMore[roomId] ?? true) : false

  // Initial load
  useEffect(() => {
    if (!roomId) return
    if (messages[roomId]) return  // already loaded

    setLoading(true)
    messagesApi.list(roomId, { limit: 50 })
      .then((msgs) => {
        setMessages(roomId, msgs)
        setHasMore(roomId, msgs.length === 50)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [roomId]) // eslint-disable-line

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!roomId || !canLoadMore || loading) return
    const oldest = roomMessages[0]
    if (!oldest) return

    setLoading(true)
    try {
      const older = await messagesApi.list(roomId, {
        limit: 50, before: oldest.id,
      })
      prependMessages(roomId, older)
      setHasMore(roomId, older.length === 50)
    } finally {
      setLoading(false)
    }
  }, [roomId, canLoadMore, loading, roomMessages, prependMessages, setHasMore])

  return { messages: roomMessages, typingUsers: roomTyping, loading, loadMore, canLoadMore }
}

export function useAuth() {
  const store = require('@/store/authStore').useAuthStore
  return store()
}