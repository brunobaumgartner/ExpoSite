import CartaoPlano from '@/components/ui/CartaoPlano'

const planos = [
  {
    nome: 'Básico',
    preco: 97,
    mensagens: 50,
    modulos: ['Site (todos os tipos)', 'Subdomínio grátis', 'Suporte por Telegram'],
    destaque: false,
  },
  {
    nome: 'Pro',
    preco: 197,
    mensagens: 200,
    modulos: ['Tudo do Básico', 'E-commerce até 100 produtos', 'Agendamento até 100/mês', 'Domínio próprio'],
    destaque: true,
  },
  {
    nome: 'Business',
    preco: 597,
    mensagens: 1000,
    modulos: ['Tudo do Pro', 'Produtos e agendamentos ilimitados', 'Templates premium', 'Suporte prioritário'],
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
            7 dias grátis para testar. Cancele quando quiser, sem multa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {planos.map((plano) => (
            <CartaoPlano key={plano.nome} {...plano} />
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-10">
          Todos os planos incluem SSL grátis, backups diários e hospedagem incluída.
        </p>
      </div>
    </section>
  )
}
