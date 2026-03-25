import { AlertTriangle } from 'lucide-react'

export function Disclaimer() {
  return (
    <section className="border-t border-gray-200 bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-900">Aviso importante</h3>
            <p className="mt-2 text-sm text-amber-800">
              Este produto é apenas para fins informativos e de autoavaliação.
              Não fornece diagnóstico médico, não substitui avaliação de
              profissionais de saúde e não fornece QI oficial. Para questões
              relacionadas à saúde mental ou cognitiva, consulte um profissional
              qualificado.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
