import Botao from './Botao'

interface Props {
  nome: string
  preco: number
  mensagens: number
  modulos: string[]
  destaque?: boolean
}

export default function CartaoPlano({ nome, preco, mensagens, modulos, destaque = false }: Props) {
  return (
    <div className={`relative flex flex-col rounded-2xl p-8 ${destaque ? 'bg-violet-600 text-white shadow-2xl scale-105' : 'bg-white text-slate-900 border border-slate-200 shadow-md'}`}>
      {destaque && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
          Mais popular
        </span>
      )}

      <h3 className={`text-xl font-bold mb-1 ${destaque ? 'text-white' : 'text-slate-900'}`}>{nome}</h3>

      <div className="my-4">
        <span className={`text-4xl font-extrabold ${destaque ? 'text-white' : 'text-violet-600'}`}>
          R$ {preco}
        </span>
        <span className={`text-sm ml-1 ${destaque ? 'text-violet-200' : 'text-slate-500'}`}>/mês</span>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        <li className={`flex items-center gap-2 text-sm ${destaque ? 'text-violet-100' : 'text-slate-600'}`}>
          <span className="text-base">💬</span>
          {mensagens.toLocaleString('pt-BR')} mensagens/mês
        </li>
        {modulos.map((m) => (
          <li key={m} className={`flex items-center gap-2 text-sm ${destaque ? 'text-violet-100' : 'text-slate-600'}`}>
            <span className="text-green-400">✓</span> {m}
          </li>
        ))}
      </ul>

      <Botao
        href="/cadastro"
        variante={destaque ? 'fantasma' : 'primario'}
        tamanho="md"
        className="w-full"
      >
        Contratar
      </Botao>
    </div>
  )
}
