const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken(): string {
  return localStorage.getItem('token') || ''
}

async function req<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    req<{ token: string; user: import('@/types').User }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    req<{ token: string; user: import('@/types').User }>('/auth/login', {
      method: 'POST', body: JSON.stringify(data),
    }),
  me: () => req<import('@/types').User>('/auth/me'),
}

// Rooms
export const roomsApi = {
  list:    () => req<import('@/types').Room[]>('/rooms'),
  create:  (data: { name: string; description?: string; isPrivate?: boolean }) =>
    req<import('@/types').Room>('/rooms', {
      method: 'POST', body: JSON.stringify(data),
    }),
  join:    (id: string) => req<{ success: boolean }>(`/rooms/${id}/join`, { method: 'POST' }),
  members: (id: string) => req<import('@/types').OnlineUser[]>(`/rooms/${id}/members`),
}

// Messages
export const messagesApi = {
  list: (roomId: string, params?: { limit?: number; before?: string }) => {
    const q = new URLSearchParams()
    if (params?.limit)  q.set('limit',  String(params.limit))
    if (params?.before) q.set('before', params.before)
    return req<import('@/types').Message[]>(
      `/messages/${roomId}${q.toString() ? '?' + q : ''}`
    )
  },
}