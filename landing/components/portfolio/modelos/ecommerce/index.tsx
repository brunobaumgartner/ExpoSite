import type { Exemplo } from '../../tipos'

const produtos = [
  { nome: 'Blusa Floral',  preco: 'R$ 89',  parcela: '3x R$ 29', emoji: '👚', destaque: true  },
  { nome: 'Saia Midi',     preco: 'R$ 129', parcela: '4x R$ 32', emoji: '👗', destaque: false },
  { nome: 'Vestido Leve',  preco: 'R$ 159', parcela: '5x R$ 31', emoji: '👘', destaque: true  },
  { nome: 'Calça Jeans',   preco: 'R$ 149', parcela: '5x R$ 29', emoji: '👖', destaque: false },
  { nome: 'Cardigan',      preco: 'R$ 99',  parcela: '3x R$ 33', emoji: '🧥', destaque: false },
  { nome: 'Bolsa Tote',    preco: 'R$ 79',  parcela: '2x R$ 39', emoji: '👜', destaque: true  },
]

export default function TemplateEcommerce({ ex }: { ex: Exemplo }) {
  return (
    <div className="font-sans">
      <div style={{ background: ex.tema.primaria }} className="px-6 py-4 flex items-center justify-between text-white">
        <div>
          <p className="font-black text-base">{ex.negocio}</p>
          <p className="text-white/70 text-xs">Moda feminina</p>
        </div>
        <div className="flex gap-3 text-lg">
          <span>🔍</span><span>🛒</span>
        </div>
      </div>

      <div style={{ background: ex.tema.texto }} className="px-6 py-3 flex gap-2 overflow-x-auto">
        {['Novidades', 'Blusas', 'Saias', 'Vestidos', 'Acessórios'].map((c, i) => (
          <button key={i}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={i === 0 ? { background: ex.tema.primaria, color: '#fff', borderColor: 'transparent' } : { borderColor: '#cbd5e1', color: '#475569' }}>
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {produtos.map((p, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow">
              {p.destaque && (
                <div className="text-white text-xs font-bold px-2 py-0.5" style={{ background: ex.tema.primaria }}>
                  ⭐ Destaque
                </div>
              )}
              <div style={{ background: ex.tema.texto }} className="flex items-center justify-center h-24 text-4xl">
                {p.emoji}
              </div>
              <div className="p-2">
                <p className="font-semibold text-slate-800 text-xs">{p.nome}</p>
                <p className="font-black text-sm mt-0.5" style={{ color: ex.tema.primaria }}>{p.preco}</p>
                <p className="text-slate-400 text-xs">{p.parcela}</p>
                <button className="w-full mt-2 text-white text-xs py-1.5 rounded-lg font-semibold" style={{ background: ex.tema.primaria }}>
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
