import { cn } from '@/lib/utils'

interface BadgeProps {
  children:  React.ReactNode
  variant?:  'online' | 'count' | 'new'
  className?: string
}

const variants = {
  online: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  count:  'bg-dark-600 text-gray-400',
  new:    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

export function Badge({ children, variant = 'count', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}