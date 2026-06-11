import type { Exemplo } from '../../tipos'

export default function TemplateLandingPage({ ex }: { ex: Exemplo }) {
  const isLaw = ex.slug === 'adv-santos'

  return (
    <div className="font-sans text-slate-800">
      <div style={{ background: `linear-gradient(135deg, ${ex.tema.primaria}, ${ex.tema.secundaria})` }} className="px-8 py-14 text-center text-white">
        <div className="text-5xl mb-4">{ex.emoji}</div>
        <h1 className="text-3xl font-black mb-3">{ex.negocio}</h1>
        <p className="text-white/80 text-base mb-6 max-w-sm mx-auto">
          {isLaw ? 'Defendendo seus direitos com excelência e dedicação há 20 anos.' : 'Transforme seu corpo e sua vida em 90 dias com método comprovado.'}
        </p>
        <button className="bg-white font-bold px-8 py-3 rounded-full text-sm shadow-lg" style={{ color: ex.tema.primaria }}>
          {isLaw ? 'Consulta gratuita' : 'Começar agora'}
        </button>
      </div>

      <div className="bg-white px-8 py-10">
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">
          {isLaw ? 'Áreas de atuação' : 'Por que nos escolher?'}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(isLaw
            ? ['⚖️ Direito Civil', '🏠 Direito Imobiliário', '💼 Direito Trabalhista']
            : ['🏋️ Treinos personalizados', '🥗 Dieta inclusa', '📱 Acompanhamento diário']
          ).map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ background: ex.tema.texto }}>
              <p className="font-semibold text-slate-700 text-xs">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-10">
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Depoimentos</h2>
        <div className="grid grid-cols-2 gap-4">
          {(isLaw
            ? [{ nome: 'Roberto A.', texto: 'Ganhamos a causa! Excelente profissional.' }, { nome: 'Fernanda L.', texto: 'Muito competente e atencioso.' }]
            : [{ nome: 'Ana S.', texto: 'Perdi 12kg em 3 meses! Incrível!' }, { nome: 'Carlos M.', texto: 'Melhor academia da cidade!' }]
          ).map((t, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-slate-600 text-xs italic mb-2">"{t.texto}"</p>
              <p className="text-xs font-semibold" style={{ color: ex.tema.primaria }}>— {t.nome}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-10 text-center text-white" style={{ background: ex.tema.primaria }}>
        <h2 className="text-xl font-black mb-3">{isLaw ? 'Agende uma consulta' : 'Primeira semana grátis!'}</h2>
        <button className="bg-white font-bold px-8 py-3 rounded-full text-sm" style={{ color: ex.tema.primaria }}>
          {isLaw ? 'Falar com advogado' : 'Garantir minha vaga'}
        </button>
      </div>
    </div>
  )
}
