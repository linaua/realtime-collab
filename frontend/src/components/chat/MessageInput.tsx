import { useState, useRef, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'

interface MessageInputProps {
  roomId: string
}

export function MessageInput({ roomId }: MessageInputProps) {
  const [message,  setMessage]  = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { user } = useAuthStore()
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const socket = getSocket()

  const sendTypingStart = useCallback(() => {
    if (!isTyping) {
      socket.emit('typing:start', roomId)
      setIsTyping(true)
    }
    // Reset timer
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', roomId)
      setIsTyping(false)
    }, 3000)
  }, [isTyping, roomId, socket])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      sendTypingStart()
    } else {
      socket.emit('typing:stop', roomId)
      setIsTyping(false)
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }

  const handleSend = useCallback(() => {
    const content = message.trim()
    if (!content) return

    socket.emit('message:send', { roomId, content })
    setMessage('')

    // Stop typing
    socket.emit('typing:stop', roomId)
    setIsTyping(false)
    if (typingTimer.current) clearTimeout(typingTimer.current)
  }, [message, roomId, socket])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) return null

  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0">
      <div className="flex items-end gap-2 bg-dark-600 rounded-xl
                      border border-dark-400 focus-within:border-blue-500/50
                      transition-colors p-3">
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${roomId.slice(0, 8)}`}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm resize-none
                     focus:outline-none placeholder:text-gray-600
                     max-h-40 min-h-[1.5rem] leading-relaxed"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = t.scrollHeight + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-30
                     disabled:cursor-not-allowed rounded-lg flex items-center
                     justify-center transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-700 mt-1.5 px-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}