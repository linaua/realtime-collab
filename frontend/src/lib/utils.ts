import clsx, { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour:  '2-digit', minute: '2-digit',
  })
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

export function groupMessagesByDate(
  messages: import('@/types').Message[]
): Map<string, import('@/types').Message[]> {
  const groups = new Map<string, import('@/types').Message[]>()
  for (const msg of messages) {
    const date = new Date(msg.created_at).toDateString()
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(msg)
  }
  return groups
}