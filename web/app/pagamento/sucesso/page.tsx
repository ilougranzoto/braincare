'use client'

import { useEffect } from 'react'
import { CheckCircle2, Brain } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

export default function PaymentSuccessPage() {
  useEffect(() => {
    trackEvent('payment_completed')
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Pagamento confirmado!</h1>
        <p className="mt-2 text-gray-600">Seu relatório cognitivo completo foi desbloqueado.</p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Brain className="mr-2 h-5 w-5" />
              Ver meu relatório
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-400">Um email de confirmação foi enviado para sua conta.</p>
      </div>
    </div>
  )
}
