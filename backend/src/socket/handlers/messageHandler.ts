import { Server, Socket } from 'socket.io'
import {
  createMessage,
  editMessage,
  deleteMessage,
} from '../../services/messageService.js'
import { isMember } from '../../services/roomService.js'
import type { ClientToServerEvents, ServerToClientEvents } from '../../types.js'

export function registerMessageHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
): void {
  const { userId } = socket.user

  // Send message
  socket.on('message:send', async ({ roomId, content, replyTo }: any) => {
    if (!content?.trim()) return

    const member = await isMember(roomId, userId)
    if (!member) {
      socket.emit('error', { message: 'Not a member of this room' })
      return
    }

    const message = await createMessage({
      roomId,
      userId,
      content: content.trim(),
      replyTo,
    })

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit('message:new', message)
  })

  // Edit message
  socket.on('message:edit', async ({ messageId, content }) => {
    if (!content?.trim()) return

    const updated = await editMessage(messageId, userId, content.trim())
    if (!updated) {
      socket.emit('error', { message: 'Cannot edit this message' })
      return
    }

    io.to(updated.room_id).emit('message:updated', {
      id:      updated.id,
      content: updated.content,
      edited:  true,
    })
  })

  // Delete message
  socket.on('message:delete', async (messageId) => {
    const result = await deleteMessage(messageId, userId)
    if (!result) {
      socket.emit('error', { message: 'Cannot delete this message' })
      return
    }

    io.to(result.roomId).emit('message:deleted', { messageId })
  })
}
