import { useState } from 'react'
import { motion } from 'framer-motion'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageItemProps {
  message:     Message
  isGrouped?:  boolean  // consecutive messages from same user
}

export function MessageItem({ message, isGrouped = false }: MessageItemProps) {
  const { user } = useAuthStore()
  const isOwn    = user?.id === message.user_id
  const [editing, setEditing]   = useState(false)
  const [editVal, setEditVal]   = useState(message.content)
  const [showMenu, setShowMenu] = useState(false)

  const socket = getSocket()

  const handleEdit = () => {
    if (!editVal.trim() || editVal === message.content) {
      setEditing(false)
      return
    }
    socket.emit('message:edit', { messageId: message.id, content: editVal.trim() })
    setEditing(false)
  }

  const handleDelete = () => {
    socket.emit('message:delete', message.id)
    setShowMenu(false)
  }

  if (message.deleted) {
    return (
      <div className={cn('px-4', isGrouped ? 'pt-0.5' : 'pt-3')}>
        <div className="flex items-center gap-3">
          {!isGrouped && <div className="w-8 flex-shrink-0" />}
          {isGrouped  && <div className="w-8 flex-shrink-0" />}
          <p className="text-xs text-gray-600 italic">
            [This message was deleted]
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'px-4 group relative hover:bg-dark-700/40 transition-colors',
        isGrouped ? 'pt-0.5 pb-0' : 'pt-3 pb-0'
      )}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="flex gap-3">
        {/* Avatar or timestamp */}
        <div className="w-8 flex-shrink-0 flex items-start justify-center">
          {!isGrouped ? (
            <Avatar
              username={message.username}
              color={message.color}
              avatarUrl={message.avatar_url}
              size="sm"
            />
          ) : (
            <span className="text-xs text-gray-700 mt-1 opacity-0 group-hover:opacity-100
                             transition-opacity select-none">
              {new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className="text-sm font-semibold"
                style={{ color: message.color }}
              >
                {message.username}
              </span>
              <span className="text-xs text-gray-600">
                {formatTime(message.created_at)}
              </span>
              {message.edited && (
                <span className="text-xs text-gray-700">(edited)</span>
              )}
            </div>
          )}

          {editing ? (
            <div>
              <input
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
                  if (e.key === 'Escape') setEditing(false)
                }}
                autoFocus
                className="w-full bg-dark-600 text-white text-sm px-3 py-2
                           rounded-lg border border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter to save · Esc to cancel
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* Actions (hover) */}
        {isOwn && !editing && (
          <div className="absolute right-4 top-0 opacity-0 group-hover:opacity-100
                          transition-opacity flex gap-1 bg-dark-700 border border-dark-500
                          rounded-lg p-1 shadow-lg -translate-y-1/2">
            <button
              onClick={() => { setEditVal(message.content); setEditing(true) }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-600
                         rounded-md transition-colors text-xs"
              title="Edit"
            >
              ✏
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-dark-600
                         rounded-md transition-colors text-xs"
              title="Delete"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}