const passos = [
  {
    numero: '01',
    emoji: '📋',
    titulo: 'Escolha seu plano',
    descricao: 'Selecione o tipo de site que seu negócio precisa e o plano ideal. Em menos de 2 minutos você conclui o cadastro.',
  },
  {
    numero: '02',
    emoji: '💬',
    titulo: 'Converse no Telegram',
    descricao: 'O agente te adiciona no Telegram e faz as perguntas certas. Você responde e ele cria e publica seu site automaticamente.',
  },
  {
    numero: '03',
    emoji: '🚀',
    titulo: 'Gerencie por mensagem',
    descricao: 'Precisa mudar um preço? Adicionar foto? Ver agendamentos? É só mandar mensagem — de texto ou voz.',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Simples assim</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
            Como funciona
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Três passos e seu site está no ar. Sem nenhum conhecimento técnico.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {passos.map((passo, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <span className="absolute -top-4 -left-4 bg-violet-600 text-white text-sm font-bold w-10 h-10 rounded-xl flex items-center justify-center shadow">
                {passo.numero}
              </span>
              <div className="text-4xl mb-4">{passo.emoji}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{passo.titulo}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
