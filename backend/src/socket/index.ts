import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { socketAuthMiddleware } from './middleware.js'
import { registerRoomHandlers } from './handlers/roomHandler.js'
import { registerMessageHandlers } from './handlers/messageHandler.js'
import { removeOnlineUser, removeTyping, getTypingUsers } from '../services/cacheService.js'
import type { ClientToServerEvents, ServerToClientEvents } from '../types.js'

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout:  60_000,
    pingInterval: 25_000,
  })

  // Auth middleware
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    const { userId, username } = socket.user
    console.log(`🔌 ${username} connected (socket: ${socket.id})`)

    // Register handlers
    registerRoomHandlers(io, socket)
    registerMessageHandlers(io, socket)

    // Disconnect cleanup
    socket.on('disconnect', async () => {
      console.log(`❌ ${username} disconnected`)

      // Remove from all rooms they were in
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id)

      for (const roomId of rooms) {
        await removeOnlineUser(roomId, userId)
        await removeTyping(roomId, username)

        io.to(roomId).emit('room:user_left', { userId, username })

        const typingUsers = await getTypingUsers(roomId)
        io.to(roomId).emit('typing:update', { roomId, users: typingUsers })
      }
    })
  })

  return io
}