'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-500">
        {current}/{total}
      </span>
    </div>
  )
}
