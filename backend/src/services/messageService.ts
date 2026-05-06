import { db } from '../config/database.js'
import {
  cacheMessage,
  getCachedMessages,
  invalidateMessageCache,
} from './cacheService.js'
import type { Message } from '../types.js'

const MESSAGE_QUERY = `
  SELECT
    m.id, m.room_id, m.user_id, m.content, m.type,
    m.edited, m.deleted, m.reply_to,
    m.created_at, m.updated_at,
    u.username, u.color, u.avatar_url
  FROM messages m
  JOIN users u ON u.id = m.user_id
`

export async function getMessages(
  roomId: string,
  limit = 50,
  before?: string
): Promise<Message[]> {
  // Try cache first (only for initial load without cursor)
  if (!before) {
    const cached = await getCachedMessages(roomId)
    if (cached) return cached
  }

  let query = MESSAGE_QUERY + `
    WHERE m.room_id = $1 AND m.deleted = FALSE
  `
  const params: (string | number)[] = [roomId]

  if (before) {
    params.push(before)
    query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $2)`
  }

  query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`
  params.push(limit)

  const result = await db.query(query, params)
  const messages = result.rows.reverse() as Message[]

  // Cache only the first page
  if (!before) {
    for (const msg of messages) {
      await cacheMessage(roomId, msg)
    }
  }

  return messages
}

export async function createMessage(data: {
  roomId:  string
  userId:  string
  content: string
  replyTo?: string
}): Promise<Message> {
  const result = await db.query(
    `INSERT INTO messages (room_id, user_id, content, reply_to)
     VALUES ($1, $2, $3, $4)
     RETURNING id, room_id, user_id, content, type, edited, deleted,
               reply_to, created_at, updated_at`,
    [data.roomId, data.userId, data.content, data.replyTo || null]
  )

  const msgRow = result.rows[0]

  // Join user info
  const userResult = await db.query(
    'SELECT username, color, avatar_url FROM users WHERE id = $1',
    [data.userId]
  )
  const user = userResult.rows[0]

  const message: Message = { ...msgRow, ...user }

  // Update cache
  await cacheMessage(data.roomId, message)

  return message
}

export async function editMessage(
  messageId: string,
  userId: string,
  content: string
): Promise<Message | null> {
  const result = await db.query(
    `UPDATE messages
     SET content = $1, edited = TRUE, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND deleted = FALSE
     RETURNING *`,
    [content, messageId, userId]
  )
  if (result.rowCount === 0) return null

  const msg = result.rows[0] as Message
  await invalidateMessageCache(msg.room_id)
  return msg
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ roomId: string } | null> {
  const result = await db.query(
    `UPDATE messages
     SET deleted = TRUE, content = '[deleted]', updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING room_id`,
    [messageId, userId]
  )
  if (result.rowCount === 0) return null

  const { room_id } = result.rows[0]
  await invalidateMessageCache(room_id)
  return { roomId: room_id }
}