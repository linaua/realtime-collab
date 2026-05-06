import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore } from '@/store/roomStore'
import { useAuthStore } from '@/store/authStore'
import { roomsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Room } from '@/types'

interface RoomListProps {
  onSelectRoom: (room: Room) => void
}

export function RoomList({ onSelectRoom }: RoomListProps) {
  const { rooms, activeRoom, setRooms, addRoom, setActive } = useRoomStore()
  const { user } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newName,    setNewName]    = useState('')
  const [creating,   setCreating]   = useState(false)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    roomsApi.list()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [setRooms])

  const handleSelect = (room: Room) => {
    setActive(room)
    onSelectRoom(room)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const room = await roomsApi.create({ name: newName.trim() })
      addRoom(room)
      setActive(room)
      onSelectRoom(room)
      setNewName('')
      setShowCreate(false)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-dark-600">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white font-bold text-lg tracking-tight">Collab</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-7 h-7 rounded-lg bg-dark-600 hover:bg-dark-500
                       flex items-center justify-center text-gray-400
                       hover:text-white transition-colors"
            title="New room"
          >
            +
          </button>
        </div>
        {user && (
          <p className="text-xs text-gray-600 font-medium truncate">
            @{user.username}
          </p>
        )}
      </div>

      {/* Create room form */}
      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreate}
            className="px-3 py-3 border-b border-dark-600 overflow-hidden"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="room-name"
              autoFocus
              className="w-full bg-dark-600 text-white text-sm px-3 py-2
                         rounded-lg border border-dark-400 focus:outline-none
                         focus:border-blue-500 placeholder:text-gray-600 mb-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs
                           font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-dark-600 hover:bg-dark-500 text-gray-400
                           text-xs font-semibold py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 pb-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Channels
        </p>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-3 py-1.5">
              <div className="h-7 bg-dark-600 rounded-lg animate-pulse" />
            </div>
          ))
        ) : (
          rooms.map((room) => {
            const isActive = activeRoom?.id === room.id
            return (
              <button
                key={room.id}
                onClick={() => handleSelect(room)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 mx-1 rounded-lg',
                  'text-sm transition-colors text-left group',
                  isActive
                    ? 'bg-dark-600 text-white'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
                )}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <span className="text-gray-600 group-hover:text-gray-400">
                  {room.is_private ? '🔒' : '#'}
                </span>
                <span className="truncate font-medium">{room.name}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}