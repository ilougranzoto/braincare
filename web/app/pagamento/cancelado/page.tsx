import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Pagamento cancelado</h1>
        <p className="mt-2 text-gray-600">Não se preocupe, seu resultado está salvo. Você pode tentar novamente quando quiser.</p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
