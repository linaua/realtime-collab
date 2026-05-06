import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { connectSocket, disconnectSocket } from '@/lib/socket'

interface AuthStore {
  user:    User | null
  token:   string | null
  isAuth:  boolean
  setAuth: (user: User, token: string) => void
  logout:  () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:   null,
      token:  null,
      isAuth: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        connectSocket(token)
        set({ user, token, isAuth: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        disconnectSocket()
        set({ user: null, token: null, isAuth: false })
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, token: s.token, isAuth: s.isAuth }),
      onRehydrateStorage: () => (state) => {
        // Reconnect socket after page refresh
        if (state?.token) {
          connectSocket(state.token)
        }
      },
    }
  )
)