export interface User {
  id:         string
  username:   string
  email:      string
  color:      string
  avatar_url: string | null
  created_at: string
}

export interface Room {
  id:           string
  name:         string
  description:  string | null
  slug:         string
  is_private:   boolean
  owner_id:     string
  member_count?: number
  created_at:   string
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
  created_at: string
  // Joined
  username:   string
  color:      string
  avatar_url: string | null
}

export interface OnlineUser {
  userId:   string
  username: string
  color:    string
}

export interface AuthState {
  user:    User | null
  token:   string | null
  isAuth:  boolean
}