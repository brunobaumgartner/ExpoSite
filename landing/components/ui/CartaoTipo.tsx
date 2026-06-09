interface Props {
  emoji: string
  nome: string
  descricao: string
  modulos: string[]
}

export default function CartaoTipo({ emoji, nome, descricao, modulos }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
      <div className="text-4xl">{emoji}</div>
      <h3 className="text-lg font-bold text-slate-900">{nome}</h3>
      <p className="text-sm text-slate-500 flex-1">{descricao}</p>
      <div className="flex flex-wrap gap-2">
        {modulos.map((m) => (
          <span key={m} className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full font-medium">
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}
