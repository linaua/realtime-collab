import { useEffect, useRef, useState } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { MessageItem } from './MessageItem'
import { MessageSkeleton } from '@/components/ui/Skeleton'
import type { Message } from '@/types'

interface MessageListProps {
  roomId:     string
  typingUsers: string[]
  currentUsername: string
}

function shouldGroup(prev: Message, curr: Message): boolean {
  if (prev.user_id !== curr.user_id) return false
  const diff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()
  return diff < 5 * 60 * 1000  // 5 minutes
}

function DateDivider({ date }: { date: string }) {
  const label = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 h-px bg-dark-600" />
      <span className="text-xs text-gray-600 font-medium bg-dark-800 px-2">{label}</span>
      <div className="flex-1 h-px bg-dark-600" />
    </div>
  )
}

export function MessageList({ roomId, typingUsers, currentUsername }: MessageListProps) {
  const { messages, loading, loadMore, canLoadMore } = useMessages(roomId)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const topRef     = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  // Infinite scroll upward
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    if (topRef.current) observer.observe(topRef.current)
    return () => observer.disconnect()
  }, [canLoadMore, loading, loadMore])

  // Track scroll position for auto-scroll
  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(distFromBottom < 100)
  }

  // Group messages by date
  const grouped = new Map<string, Message[]>()
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString()
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(msg)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-2"
      onScroll={handleScroll}
    >
      {/* Load more trigger */}
      <div ref={topRef} className="h-1" />

      {loading && (
        <div className="space-y-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Messages grouped by date */}
      {Array.from(grouped.entries()).map(([day, dayMessages]) => (
        <div key={day}>
          <DateDivider date={dayMessages[0].created_at} />
          {dayMessages.map((msg, i) => {
            const prev = i > 0 ? dayMessages[i - 1] : null
            const grouped = prev ? shouldGroup(prev, msg) : false
            return (
              <MessageItem
                key={msg.id}
                message={msg}
                isGrouped={grouped}
              />
            )
          })}
        </div>
      ))}

      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-600">
          <span className="text-5xl mb-3">💬</span>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm mt-1">Be the first to say something!</p>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.filter((u) => u !== currentUsername).length > 0 && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {typingUsers.filter((u) => u !== currentUsername).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}