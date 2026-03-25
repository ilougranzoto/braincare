import { ClipboardCheck, BarChart3, FileText } from 'lucide-react'

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Faça o teste',
    description: 'Responda 20 perguntas adaptativas que avaliam atenção e raciocínio lógico. Sem cadastro necessário.',
  },
  {
    icon: BarChart3,
    title: 'Veja seu perfil',
    description: 'Receba instantaneamente seu score e percentil comparativo. Descubra como você se posiciona.',
  },
  {
    icon: FileText,
    title: 'Receba recomendações',
    description: 'Desbloqueie seu relatório completo com análise detalhada e recomendações personalizadas.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          Como funciona
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
          Um processo simples em 3 etapas para entender seu perfil cognitivo
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                Etapa {i + 1}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 pt-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
