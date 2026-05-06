import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck:     true,
  retryStrategy(times) {
    if (times > 5) return null
    return Math.min(times * 100, 3000)
  },
})

redis.on('connect',  () => console.log('✅ Redis connected'))
redis.on('error',    (err) => console.error('Redis error:', err))

// Key helpers — prefix all keys
export const KEY = {
  // Online users in a room: Set of user IDs
  roomOnline:   (roomId: string) => `room:${roomId}:online`,
  // User socket mapping: Hash { socketId: userId }
  userSocket:   (userId: string) => `user:${userId}:socket`,
  // Room messages cache: List (last 50 messages as JSON)
  roomMessages: (roomId: string) => `room:${roomId}:messages`,
  // User info cache: Hash (username, color, avatar)
  userInfo:     (userId: string) => `user:${userId}:info`,
  // Typing users: Set of usernames
  roomTyping:   (roomId: string) => `room:${roomId}:typing`,
}

export const CACHE_TTL = {
  messages: 60 * 10,   // 10 minutes
  userInfo: 60 * 60,   // 1 hour
  typing:   5,         // 5 seconds (auto-expire)
}