import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrainCare - Descubra seu Perfil Cognitivo',
  description: 'Teste cognitivo gratuito de 5 minutos. Descubra seu perfil de foco, raciocínio lógico e receba recomendações personalizadas.',
  keywords: ['teste cognitivo', 'perfil cognitivo', 'foco', 'raciocínio lógico', 'autoavaliação'],
  openGraph: {
    title: 'BrainCare - Descubra seu Perfil Cognitivo',
    description: 'Teste cognitivo gratuito de 5 minutos. Descubra seu perfil de foco e raciocínio lógico.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
