import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useRoomStore } from '@/store/roomStore'
import type { OnlineUser } from '@/types'

export function useRoom(roomId: string | null) {
  const { setOnline, addOnline, removeOnline, activeRoom } = useRoomStore()

  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()

    // Join room
    socket.emit('room:join', roomId)

    // Listen for room-specific online events
    const onOnlineUsers = (users: OnlineUser[]) => setOnline(roomId, users)
    const onUserJoined  = (user: OnlineUser) => addOnline(roomId, user)
    const onUserLeft    = ({ userId }: { userId: string }) => removeOnline(roomId, userId)

    socket.on('room:online_users', onOnlineUsers)
    socket.on('room:user_joined',  onUserJoined)
    socket.on('room:user_left',    onUserLeft)

    return () => {
      socket.emit('room:leave', roomId)
      socket.off('room:online_users', onOnlineUsers)
      socket.off('room:user_joined',  onUserJoined)
      socket.off('room:user_left',    onUserLeft)
    }
  }, [roomId, setOnline, addOnline, removeOnline])

  return {
    onlineUsers: useRoomStore((s) => s.onlineUsers[roomId || ''] || []),
  }
}