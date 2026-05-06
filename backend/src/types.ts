export interface User {
  id:         string
  username:   string
  email:      string
  avatar_url: string | null
  color:      string
  created_at: Date
}

export interface Room {
  id:          string
  name:        string
  description: string | null
  slug:        string
  is_private:  boolean
  owner_id:    string
  created_at:  Date
}

export interface Message {
  id:         string
  room_id:    string
  user_id:    string
  content:    string
  type:       'text' | 'system' | 'file'
  edited:     boolean
  deleted:    boolean
  reply_to:   string | null
  created_at: Date
  // Joined fields
  username?:  string
  color?:     string
  avatar_url?: string | null
}

export interface RoomMember {
  room_id:   string
  user_id:   string
  role:      'owner' | 'admin' | 'member'
  joined_at: Date
  username:  string
  color:     string
}

// JWT payload
export interface JWTPayload {
  userId:   string
  username: string
  email:    string
  iat?:     number
  exp?:     number
}

// Socket events — client → server
export interface ClientToServerEvents {
  'room:join':        (roomId: string) => void
  'room:leave':       (roomId: string) => void
  'message:send':     (data: SendMessageData) => void
  'message:edit':     (data: EditMessageData) => void
  'message:delete':   (messageId: string) => void
  'typing:start':     (roomId: string) => void
  'typing:stop':      (roomId: string) => void
}

// Socket events — server → client
export interface ServerToClientEvents {
  'room:user_joined':  (data: { userId: string; username: string; color: string }) => void
  'room:user_left':    (data: { userId: string; username: string }) => void
  'room:online_users': (users: OnlineUser[]) => void
  'message:new':       (message: Message) => void
  'message:updated':   (message: Partial<Message> & { id: string }) => void
  'message:deleted':   (data: { messageId: string }) => void
  'typing:update':     (data: { roomId: string; users: string[] }) => void
  'error':             (data: { message: string }) => void
}

export interface SendMessageData {
  roomId:  string
  content: string
  replyTo?: string
}

export interface EditMessageData {
  messageId: string
  content:   string
}

export interface OnlineUser {
  userId:   string
  username: string
  color:    string
}