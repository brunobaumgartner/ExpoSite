import CartaoPlano from '@/components/ui/CartaoPlano'

const planos = [
  {
    nome: 'Institucional',
    preco: 99,
    tarefas: 100,
    foco: 'Sites de conteúdo e leads',
    modulos: [
      'Landing page ou site institucional',
      'Gerenciamento completo pelo Telegram',
      'Subdomínio grátis incluído',
      'SSL e hospedagem incluídos',
    ],
    destaque: false,
  },
  {
    nome: 'Service & Agendamento',
    preco: 139,
    tarefas: 200,
    foco: 'Barbearias, salões e clínicas',
    modulos: [
      'Tudo do Institucional',
      'Sistema de agendamento online',
      'Cardápio digital',
      'Gestão de serviços e horários',
    ],
    destaque: false,
  },
  {
    nome: 'E-commerce Starter',
    preco: 159,
    tarefas: 250,
    foco: 'Pequenas lojas virtuais',
    modulos: [
      'Tudo do Institucional',
      'Loja com até 50 produtos',
      'Gestão de pedidos',
      'Catálogo com fotos e preços',
    ],
    destaque: true,
  },
  {
    nome: 'E-commerce Avançado',
    preco: 299,
    tarefas: 600,
    foco: 'Lojas consolidadas e equipes',
    modulos: [
      'Tudo dos planos anteriores',
      'Produtos e agendamentos ilimitados',
      'Até 3 usuários na equipe',
      'Domínio próprio incluído',
    ],
    destaque: false,
  },
]

export default function Planos() {
  return (
    <section id="planos" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Sem surpresas</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
            Planos e preços
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Escolha pelo tipo do seu negócio. 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {planos.map((plano) => (
            <CartaoPlano key={plano.nome} {...plano} />
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl mx-auto text-center">
          <p className="font-semibold text-slate-800 mb-2">Atingiu o limite mensal?</p>
          <p className="text-slate-500 text-sm mb-4">
            Sem problema. O bot te avisa no Telegram e você pode comprar tarefas avulsas para o mês:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { qtd: '+10 tarefas', preco: 'R$ 15' },
              { qtd: '+20 tarefas', preco: 'R$ 25' },
              { qtd: '+30 tarefas', preco: 'R$ 35' },
            ].map((p) => (
              <div key={p.qtd} className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2 text-center">
                <p className="text-violet-700 font-bold text-sm">{p.preco}</p>
                <p className="text-violet-500 text-xs">{p.qtd}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Todos os planos incluem SSL grátis, backups diários e hospedagem incluída.
        </p>
      </div>
    </section>
  )
}
