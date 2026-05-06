import { Avatar } from '@/components/ui/Avatar'
import type { OnlineUser } from '@/types'

interface OnlineUsersProps {
  users: OnlineUser[]
}

export function OnlineUsers({ users }: OnlineUsersProps) {
  return (
    <div className="w-56 border-l border-dark-600 bg-dark-800 flex-shrink-0
                    hidden lg:flex flex-col">
      <div className="px-4 py-3 border-b border-dark-600">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Online — {users.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {users.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                       hover:bg-dark-700 transition-colors"
          >
            <Avatar
              username={user.username}
              color={user.color}
              size="sm"
              online={true}
            />
            <span className="text-sm text-gray-300 font-medium truncate">
              {user.username}
            </span>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-xs text-gray-600 px-2 py-4 text-center">
            No one else is here yet
          </p>
        )}
      </div>
    </div>
  )
}