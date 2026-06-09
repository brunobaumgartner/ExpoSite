import Botao from './Botao'

interface Props {
  nome: string
  preco: number
  tarefas: number
  foco: string
  modulos: string[]
  destaque?: boolean
}

export default function CartaoPlano({ nome, preco, tarefas, foco, modulos, destaque = false }: Props) {
  return (
    <div className={`relative flex flex-col rounded-2xl p-6 ${destaque ? 'bg-violet-600 text-white shadow-2xl ring-2 ring-violet-400' : 'bg-white text-slate-900 border border-slate-200 shadow-sm'}`}>
      {destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
          Mais popular
        </span>
      )}

      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${destaque ? 'text-violet-200' : 'text-violet-600'}`}>
        {foco}
      </p>
      <h3 className={`text-lg font-extrabold mb-4 ${destaque ? 'text-white' : 'text-slate-900'}`}>{nome}</h3>

      <div className="mb-4">
        <span className={`text-4xl font-extrabold ${destaque ? 'text-white' : 'text-violet-600'}`}>
          R$ {preco}
        </span>
        <span className={`text-sm ml-1 ${destaque ? 'text-violet-200' : 'text-slate-500'}`}>/mês</span>
      </div>

      <div className={`text-xs font-medium px-3 py-1.5 rounded-full mb-5 self-start ${destaque ? 'bg-violet-500 text-violet-100' : 'bg-violet-50 text-violet-700'}`}>
        {tarefas} tarefas / mês
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {modulos.map((m) => (
          <li key={m} className={`flex items-start gap-2 text-sm ${destaque ? 'text-violet-100' : 'text-slate-600'}`}>
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            {m}
          </li>
        ))}
      </ul>

      <Botao
        href="/cadastro"
        variante={destaque ? 'fantasma' : 'primario'}
        tamanho="md"
        className="w-full"
      >
        Começar grátis
      </Botao>
    </div>
  )
}
