const exemplos = [
  { tipo: 'Landing Page', negocio: 'Academia FitLife', emoji: '💪', cor: 'from-blue-500 to-blue-700' },
  { tipo: 'Agendamento', negocio: 'Barbearia do João', emoji: '✂️', cor: 'from-slate-700 to-slate-900' },
  { tipo: 'Cardápio', negocio: 'Pizzaria Bella', emoji: '🍕', cor: 'from-red-500 to-red-700' },
  { tipo: 'E-commerce', negocio: 'Loja da Maria', emoji: '👗', cor: 'from-pink-500 to-pink-700' },
  { tipo: 'Institucional', negocio: 'Clínica Dr. Silva', emoji: '🏥', cor: 'from-teal-500 to-teal-700' },
  { tipo: 'Landing Page', negocio: 'Escritório Adv. Santos', emoji: '⚖️', cor: 'from-amber-600 to-amber-800' },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Exemplos reais</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
            Portfólio
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Sites criados pela plataforma para negócios como o seu.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exemplos.map((ex, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer">
              <div className={`bg-gradient-to-br ${ex.cor} h-48 flex flex-col items-center justify-center text-white`}>
                <span className="text-6xl mb-2">{ex.emoji}</span>
                <span className="text-sm font-medium opacity-80">{ex.tipo}</span>
              </div>
              <div className="bg-white p-4 flex items-center justify-between">
                <p className="font-semibold text-slate-800 text-sm">{ex.negocio}</p>
                <span className="text-xs text-slate-400 group-hover:text-violet-600 transition-colors">Ver site →</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          * Demonstrações. Portfólio real disponível após o lançamento.
        </p>
      </div>
    </section>
  )
}
