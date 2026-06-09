import CartaoTipo from '@/components/ui/CartaoTipo'

const tipos = [
  {
    emoji: '🎯',
    nome: 'Landing Page',
    descricao: 'Página única para apresentar seu negócio, capturar leads e divulgar serviços.',
    modulos: ['Site'],
  },
  {
    emoji: '🏢',
    nome: 'Institucional',
    descricao: 'Site completo com múltiplas seções: sobre, serviços, equipe, contato e blog.',
    modulos: ['Site'],
  },
  {
    emoji: '🛒',
    nome: 'E-commerce',
    descricao: 'Loja online com catálogo de produtos, carrinho e gestão de pedidos.',
    modulos: ['Site', 'E-commerce'],
  },
  {
    emoji: '🍽️',
    nome: 'Cardápio Digital',
    descricao: 'Menu digital com categorias, fotos e preços. Ideal para restaurantes e lanchonetes.',
    modulos: ['Site', 'Cardápio'],
  },
  {
    emoji: '📅',
    nome: 'Agendamento',
    descricao: 'Site com sistema de agendamento online para barbearias, clínicas e salões.',
    modulos: ['Site', 'Agendamento'],
  },
]

export default function TiposDeSite() {
  return (
    <section id="tipos-de-site" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Para cada negócio</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
            Tipos de site
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Escolha o modelo certo para o seu negócio. Todos gerenciados pelo Telegram.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tipos.map((tipo) => (
            <CartaoTipo key={tipo.nome} {...tipo} />
          ))}
        </div>
      </div>
    </section>
  )
}
