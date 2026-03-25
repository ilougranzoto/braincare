'use client'

import { Suspense } from 'react'
import { TestContainer } from '@/components/test/test-container'
import { Brain } from 'lucide-react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-gray-900">BrainCare</span>
          </div>
          <span className="text-sm text-gray-500">Teste Cognitivo</span>
        </div>
      </header>

      <main className="py-8">
        <Suspense fallback={null}>
          <TestContainer />
        </Suspense>
      </main>
    </div>
  )
}
