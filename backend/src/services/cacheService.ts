import { redis, KEY, CACHE_TTL } from '../config/redis.js'
import type { Message, OnlineUser } from '../types.js'

// ─── Online users ────────────────────────────────────────────

export async function addOnlineUser(
  roomId: string,
  user: OnlineUser
): Promise<void> {
  await redis.hset(KEY.roomOnline(roomId), user.userId, JSON.stringify(user))
}

export async function removeOnlineUser(
  roomId: string,
  userId: string
): Promise<void> {
  await redis.hdel(KEY.roomOnline(roomId), userId)
}

export async function getOnlineUsers(roomId: string): Promise<OnlineUser[]> {
  const data = await redis.hgetall(KEY.roomOnline(roomId))
  return Object.values(data).map((v) => JSON.parse(v) as OnlineUser)
}

// ─── Message cache (last 50 per room) ────────────────────────

export async function cacheMessage(
  roomId: string,
  message: Message
): Promise<void> {
  const key = KEY.roomMessages(roomId)
  await redis.lpush(key, JSON.stringify(message))
  await redis.ltrim(key, 0, 49)         // keep last 50
  await redis.expire(key, CACHE_TTL.messages)
}

export async function getCachedMessages(
  roomId: string
): Promise<Message[] | null> {
  const key  = KEY.roomMessages(roomId)
  const data = await redis.lrange(key, 0, -1)
  if (data.length === 0) return null
  // lpush = newest first, so reverse for chronological order
  return data.map((d) => JSON.parse(d) as Message).reverse()
}

export async function invalidateMessageCache(roomId: string): Promise<void> {
  await redis.del(KEY.roomMessages(roomId))
}

// ─── User info cache ─────────────────────────────────────────

export async function cacheUserInfo(user: {
  id: string; username: string; color: string; avatar_url: string | null
}): Promise<void> {
  await redis.hset(KEY.userInfo(user.id), {
    username:   user.username,
    color:      user.color,
    avatar_url: user.avatar_url || '',
  })
  await redis.expire(KEY.userInfo(user.id), CACHE_TTL.userInfo)
}

// ─── Typing indicators ───────────────────────────────────────

export async function setTyping(
  roomId: string,
  username: string
): Promise<void> {
  const key = KEY.roomTyping(roomId)
  await redis.sadd(key, username)
  await redis.expire(key, CACHE_TTL.typing)
}

export async function removeTyping(
  roomId: string,
  username: string
): Promise<void> {
  await redis.srem(KEY.roomTyping(roomId), username)
}

export async function getTypingUsers(roomId: string): Promise<string[]> {
  return redis.smembers(KEY.roomTyping(roomId))
}