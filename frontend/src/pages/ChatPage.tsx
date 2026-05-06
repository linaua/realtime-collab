import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore }    from '@/store/authStore'
import { useRoomStore }    from '@/store/roomStore'
import { useMessageStore } from '@/store/messageStore'
import { useSocket }       from '@/hooks/useSocket'
import { useRoom }         from '@/hooks/useRoom'
import { useMessages }     from '@/hooks/useMessages'
import { RoomList }        from '@/components/room/RoomList'
import { RoomHeader }      from '@/components/room/RoomHeader'
import { OnlineUsers }     from '@/components/room/OnlineUsers'
import { MessageList }     from '@/components/chat/MessageList'
import { MessageInput }    from '@/components/chat/MessageInput'
import type { Room }       from '@/types'

export function ChatPage() {
  const navigate = useNavigate()
  const { user, isAuth } = useAuthStore()
  const { activeRoom }   = useRoomStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect if not auth
  useEffect(() => {
    if (!isAuth) navigate('/login')
  }, [isAuth, navigate])

  // Initialize global socket listeners
  useSocket()

  // Room-specific listeners
  const { onlineUsers } = useRoom(activeRoom?.id || null)

  // Messages for active room
  const { typingUsers } = useMessages(activeRoom?.id || null)

  if (!isAuth || !user) return null

  return (
    <div className="h-screen flex bg-dark-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        w-60 bg-dark-800 border-r border-dark-600 flex-shrink-0 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static absolute inset-y-0 left-0 z-30
      `}>
        <RoomList
          onSelectRoom={() => setSidebarOpen(false)}
        />

        {/* User panel at bottom */}
        <div className="border-t border-dark-600 px-3 py-3 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: user.color }}
          >
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user.username}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
          <button
            onClick={() => { useAuthStore.getState().logout(); navigate('/login') }}
            className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
            title="Sign out"
          >
            ⏻
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeRoom ? (
          <>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center px-3 h-12
                            border-b border-dark-600 bg-dark-800">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors mr-2"
              >
                ☰
              </button>
              <span className="text-white font-semibold">#{activeRoom.name}</span>
            </div>

            {/* Room header */}
            <RoomHeader
              room={activeRoom}
              onlineCount={onlineUsers.length}
            />

            {/* Messages + online users */}
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-w-0">
                <MessageList
                  roomId={activeRoom.id}
                  typingUsers={typingUsers}
                  currentUsername={user.username}
                />
                <MessageInput roomId={activeRoom.id} />
              </div>
              <OnlineUsers users={onlineUsers} />
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Welcome, {user.username}!
            </h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Select a channel from the sidebar to start chatting,
              or create a new one.
            </p>
            {/* Mobile: show open sidebar button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="mt-6 md:hidden bg-blue-600 text-white px-5 py-2.5
                         rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Browse Channels
            </button>
          </div>
        )}
      </div>
    </div>
  )
}