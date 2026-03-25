import { Brain } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-gray-600">
          <Brain className="h-5 w-5 text-brand-600" />
          <span className="font-semibold">BrainCare</span>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BrainCare. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
