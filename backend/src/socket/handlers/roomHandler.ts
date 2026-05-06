import { Server, Socket } from 'socket.io'
import {
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
  setTyping,
  removeTyping,
  getTypingUsers,
} from '../../services/cacheService.js'
import { joinRoom, isMember } from '../../services/roomService.js'
import type { ClientToServerEvents, ServerToClientEvents } from '../../types.js'

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
): void {
  const { userId, username } = socket.user

  // Join room
  socket.on('room:join', async (roomId) => {
    // Auto-join to DB if not already member
    const alreadyMember = await isMember(roomId, userId)
    if (!alreadyMember) {
      await joinRoom(roomId, userId)
    }

    // Join Socket.io room
    socket.join(roomId)

    // Track online user in Redis
    const userInfo = await getUserColor(userId)
    const onlineUser = {
      userId,
      username,
      color: userInfo?.color || '#3b82f6',
    }
    await addOnlineUser(roomId, onlineUser)

    // Notify others
    socket.to(roomId).emit('room:user_joined', onlineUser)

    // Send current online list to the joining user
    const onlineUsers = await getOnlineUsers(roomId)
    socket.emit('room:online_users', onlineUsers)

    console.log(`${username} joined room ${roomId}`)
  })

  // Leave room
  socket.on('room:leave', async (roomId) => {
    socket.leave(roomId)
    await removeOnlineUser(roomId, userId)
    await removeTyping(roomId, username)

    io.to(roomId).emit('room:user_left', { userId, username })
    io.to(roomId).emit('typing:update', {
      roomId,
      users: await getTypingUsers(roomId),
    })
  })

  // Typing start
  socket.on('typing:start', async (roomId) => {
    await setTyping(roomId, username)
    const typingUsers = await getTypingUsers(roomId)
    socket.to(roomId).emit('typing:update', { roomId, users: typingUsers })
  })

  // Typing stop
  socket.on('typing:stop', async (roomId) => {
    await removeTyping(roomId, username)
    const typingUsers = await getTypingUsers(roomId)
    socket.to(roomId).emit('typing:update', { roomId, users: typingUsers })
  })
}

// Helper to get user color from PostgreSQL
async function getUserColor(userId: string): Promise<{ color: string } | null> {
  const { db } = await import('../../config/database.js')
  const result = await db.query('SELECT color FROM users WHERE id = $1', [userId])
  return result.rows[0] || null
}