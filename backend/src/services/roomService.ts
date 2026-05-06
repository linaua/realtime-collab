import { db } from '../config/database.js'
import type { Room, RoomMember } from '../types.js'

export async function getRooms(userId: string): Promise<Room[]> {
  const result = await db.query(
    `SELECT r.*, COUNT(rm2.user_id)::int AS member_count
     FROM rooms r
     LEFT JOIN room_members rm2 ON rm2.room_id = r.id
     WHERE r.is_private = FALSE
        OR r.id IN (
          SELECT room_id FROM room_members WHERE user_id = $1
        )
     GROUP BY r.id
     ORDER BY r.name ASC`,
    [userId]
  )
  return result.rows as Room[]
}

export async function createRoom(data: {
  name:        string
  description?: string
  isPrivate:   boolean
  ownerId:     string
}): Promise<Room> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const roomResult = await client.query(
      `INSERT INTO rooms (name, description, slug, is_private, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.description || null, slug, data.isPrivate, data.ownerId]
    )
    const room = roomResult.rows[0] as Room

    // Auto-join owner
    await client.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [room.id, data.ownerId]
    )

    await client.query('COMMIT')
    return room
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function joinRoom(
  roomId: string,
  userId: string
): Promise<boolean> {
  try {
    await db.query(
      `INSERT INTO room_members (room_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [roomId, userId]
    )
    return true
  } catch {
    return false
  }
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const result = await db.query(
    `SELECT rm.room_id, rm.user_id, rm.role, rm.joined_at,
            u.username, u.color, u.avatar_url
     FROM room_members rm
     JOIN users u ON u.id = rm.user_id
     WHERE rm.room_id = $1
     ORDER BY rm.joined_at ASC`,
    [roomId]
  )
  return result.rows as RoomMember[]
}

export async function isMember(
  roomId: string,
  userId: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM room_members
     WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  )
  return (result.rowCount ?? 0) > 0
}