'use client'

import { Lock } from 'lucide-react'

interface LockedSectionProps {
  title: string
}

export function LockedSection({ title }: LockedSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
      {/* Blurred fake content */}
      <div className="select-none blur-sm">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 h-20 w-full rounded-lg bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="flex items-center gap-2 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-medium text-white">
          <Lock className="h-4 w-4" />
          Conteúdo bloqueado
        </div>
      </div>
    </div>
  )
}
