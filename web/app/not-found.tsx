import Link from 'next/link'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <Brain className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-6 text-6xl font-extrabold text-gray-200">404</h1>
        <p className="mt-4 text-lg font-semibold text-gray-700">Página não encontrada</p>
        <p className="mt-2 text-gray-500">A página que você procura não existe ou foi movida.</p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="lg">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
