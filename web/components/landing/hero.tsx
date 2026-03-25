import Link from 'next/link'
import { Brain, Zap, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-4 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-brand-200 backdrop-blur-sm">
          <Brain className="h-4 w-4" />
          <span>Teste gratuito de 5 minutos</span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Descubra seu{' '}
          <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
            Perfil Cognitivo
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-delay mx-auto mt-6 max-w-2xl text-lg text-brand-200 sm:text-xl">
          Entenda como seu cérebro funciona. Avalie seu foco, raciocínio lógico
          e receba recomendações personalizadas para potencializar sua mente.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-delay-2 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/teste">
            <Button variant="accent" size="xl">
              <Zap className="mr-2 h-5 w-5" />
              Começar teste grátis
            </Button>
          </Link>
          <p className="text-sm text-brand-300">
            Sem cadastro necessário
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <Target className="h-6 w-6 text-accent-400" />
              20
            </div>
            <p className="mt-1 text-sm text-brand-300">Perguntas adaptativas</p>
          </div>
          <div className="animate-fade-in-delay">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <Zap className="h-6 w-6 text-accent-400" />
              5 min
            </div>
            <p className="mt-1 text-sm text-brand-300">Tempo médio</p>
          </div>
          <div className="animate-fade-in-delay-2">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <TrendingUp className="h-6 w-6 text-accent-400" />
              6
            </div>
            <p className="mt-1 text-sm text-brand-300">Dimensões avaliadas</p>
          </div>
        </div>
      </div>
    </section>
  )
}
