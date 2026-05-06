import type { Room } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface RoomHeaderProps {
  room:        Room
  onlineCount: number
}

export function RoomHeader({ room, onlineCount }: RoomHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 h-14
                    border-b border-dark-600 bg-dark-800 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-lg">#</span>
        <h2 className="text-white font-semibold">{room.name}</h2>
        {room.description && (
          <>
            <span className="text-dark-400">|</span>
            <p className="text-gray-500 text-sm truncate max-w-xs">
              {room.description}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="online">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5" />
          {onlineCount} online
        </Badge>
      </div>
    </div>
  )
}