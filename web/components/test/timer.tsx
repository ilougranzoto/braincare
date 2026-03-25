'use client'

import { cn } from '@/lib/utils'

interface TimerProps {
  remaining: number // ms
  total: number // ms
}

export function Timer({ remaining, total }: TimerProps) {
  const percentage = (remaining / total) * 100
  const seconds = Math.ceil(remaining / 1000)
  const isUrgent = percentage < 30

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-100',
            isUrgent ? 'bg-red-500' : percentage < 60 ? 'bg-amber-500' : 'bg-brand-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'min-w-[3ch] text-right text-sm font-bold tabular-nums',
          isUrgent ? 'text-red-600' : 'text-gray-600'
        )}
      >
        {seconds}s
      </span>
    </div>
  )
}
