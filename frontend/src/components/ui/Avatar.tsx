import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  username:   string
  color:      string
  avatarUrl?: string | null
  size?:      'sm' | 'md' | 'lg'
  online?:    boolean
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }

export function Avatar({ username, color, avatarUrl, size = 'md', online }: AvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white',
          sizes[size]
        )}
        style={{ backgroundColor: color }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
          : getInitials(username)
        }
      </div>
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-dark-800',
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          online ? 'bg-emerald-400' : 'bg-gray-500'
        )} />
      )}
    </div>
  )
}