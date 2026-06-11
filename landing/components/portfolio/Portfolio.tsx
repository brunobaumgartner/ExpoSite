import { exemplos } from './tipos'

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Exemplos reais</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Portfólio</h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Clique em qualquer exemplo para ver o template completo — navegue, interaja e sinta a experiência.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exemplos.map((ex, i) => (
            <a
              key={i}
              href={ex.templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group block"
            >
              <div className={`bg-gradient-to-br ${ex.cor} h-48 flex flex-col items-center justify-center text-white`}>
                <span className="text-6xl mb-2 group-hover:scale-110 transition-transform">{ex.emoji}</span>
                <span className="text-sm font-medium opacity-80">{ex.tipo}</span>
              </div>
              <div className="bg-white p-4 flex items-center justify-between">
                <p className="font-semibold text-slate-800 text-sm">{ex.negocio}</p>
                <span className="text-xs text-slate-400 group-hover:text-violet-600 transition-colors flex items-center gap-1">
                  Ver template
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          * Demonstrações. Portfólio real disponível após o lançamento.
        </p>
      </div>
    </section>
  )
}
