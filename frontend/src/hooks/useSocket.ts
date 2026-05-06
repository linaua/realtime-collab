import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore }    from '@/store/roomStore'
import { useMessageStore } from '@/store/messageStore'

export function useSocket() {
  const { setOnline, addOnline, removeOnline } = useRoomStore()
  const { addMessage, updateMessage, removeMessage, setTyping } = useMessageStore()

  useEffect(() => {
    const socket = getSocket()

    socket.on('room:online_users', ({ roomId, users }: { roomId: string; users: import('@/types').OnlineUser[] }) => {
      setOnline(roomId, users)
    })

    socket.on('room:user_joined', (user) => {
      // We get this from the active room context
      // roomId is implicit from the socket room
      // Handle via room-specific event
    })

    socket.on('message:new', (message) => {
      addMessage(message.room_id, message)
    })

    socket.on('message:updated', (patch) => {
      // room_id not in patch — update all rooms
      // In practice we track active room
      const store = useMessageStore.getState()
      for (const roomId of Object.keys(store.messages)) {
        updateMessage(roomId, patch.id, patch)
      }
    })

    socket.on('message:deleted', ({ messageId }) => {
      const store = useMessageStore.getState()
      for (const roomId of Object.keys(store.messages)) {
        removeMessage(roomId, messageId)
      }
    })

    socket.on('typing:update', ({ roomId, users }) => {
      setTyping(roomId, users)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    return () => {
      socket.off('room:online_users')
      socket.off('room:user_joined')
      socket.off('message:new')
      socket.off('message:updated')
      socket.off('message:deleted')
      socket.off('typing:update')
      socket.off('connect_error')
    }
  }, [addMessage, updateMessage, removeMessage, setOnline, addOnline, removeOnline, setTyping])
}