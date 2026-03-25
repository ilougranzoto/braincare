'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, className, barClassName, showLabel }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('relative h-3 w-full overflow-hidden rounded-full bg-gray-200', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-brand-500 transition-all duration-500 ease-out',
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
