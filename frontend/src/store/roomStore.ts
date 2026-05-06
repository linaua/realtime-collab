import { create } from 'zustand'
import type { Room, OnlineUser } from '@/types'

interface RoomStore {
  rooms:       Room[]
  activeRoom:  Room | null
  onlineUsers: Record<string, OnlineUser[]>  // roomId → users
  setRooms:    (rooms: Room[]) => void
  addRoom:     (room: Room) => void
  setActive:   (room: Room | null) => void
  setOnline:   (roomId: string, users: OnlineUser[]) => void
  addOnline:   (roomId: string, user: OnlineUser) => void
  removeOnline:(roomId: string, userId: string) => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms:       [],
  activeRoom:  null,
  onlineUsers: {},

  setRooms:  (rooms) => set({ rooms }),
  addRoom:   (room)  => set((s) => ({ rooms: [room, ...s.rooms] })),
  setActive: (room)  => set({ activeRoom: room }),

  setOnline: (roomId, users) =>
    set((s) => ({ onlineUsers: { ...s.onlineUsers, [roomId]: users } })),

  addOnline: (roomId, user) =>
    set((s) => {
      const existing = s.onlineUsers[roomId] || []
      const already  = existing.some((u) => u.userId === user.userId)
      if (already) return s
      return {
        onlineUsers: {
          ...s.onlineUsers,
          [roomId]: [...existing, user],
        },
      }
    }),

  removeOnline: (roomId, userId) =>
    set((s) => ({
      onlineUsers: {
        ...s.onlineUsers,
        [roomId]: (s.onlineUsers[roomId] || []).filter(
          (u) => u.userId !== userId
        ),
      },
    })),
}))