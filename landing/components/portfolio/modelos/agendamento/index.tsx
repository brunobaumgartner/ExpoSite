import type { Exemplo } from '../../tipos'

const horarios = ['09:00', '09:30', '10:00', '11:00', '14:00', '15:30', '16:00']
const ocupados = [1, 3, 5]
const servicos = [
  { nome: 'Corte simples',  preco: 'R$ 30', tempo: '30 min' },
  { nome: 'Corte + barba',  preco: 'R$ 50', tempo: '60 min' },
  { nome: 'Barba completa', preco: 'R$ 25', tempo: '30 min' },
  { nome: 'Pigmentação',    preco: 'R$ 80', tempo: '90 min' },
]

export default function TemplateAgendamento({ ex }: { ex: Exemplo }) {
  return (
    <div className="font-sans">
      <div style={{ background: ex.tema.primaria }} className="px-6 py-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{ex.emoji}</span>
          <div>
            <p className="font-bold text-sm">{ex.negocio}</p>
            <p className="text-white/60 text-xs">Seg–Sáb, 9h–18h</p>
          </div>
        </div>
        <button className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg">Agendar</button>
      </div>

      <div className="bg-white px-6 py-6">
        <h2 className="font-bold text-slate-800 mb-4 text-sm">Escolha o horário</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['Seg 9', 'Ter 10', 'Qua 11', 'Qui 12', 'Sex 13'].map((d, i) => (
            <button key={i}
              className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border"
              style={i === 2 ? { background: ex.tema.primaria, color: '#fff', borderColor: 'transparent' } : { color: '#475569', borderColor: '#e2e8f0' }}>
              {d}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {horarios.map((h, i) => (
            <button key={i} disabled={ocupados.includes(i)}
              className="py-2 rounded-lg text-xs font-medium border transition-colors"
              style={
                ocupados.includes(i)
                  ? { background: '#f1f5f9', color: '#cbd5e1', borderColor: '#f1f5f9', cursor: 'not-allowed' }
                  : i === 2
                    ? { background: ex.tema.primaria, color: '#fff', borderColor: 'transparent' }
                    : { color: '#334155', borderColor: '#e2e8f0' }
              }>
              {ocupados.includes(i) ? '—' : h}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-6">
        <h2 className="font-bold text-slate-800 mb-4 text-sm">Serviços</h2>
        <div className="space-y-3">
          {servicos.map((s, i) => (
            <div key={i} className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{s.nome}</p>
                <p className="text-slate-400 text-xs">{s.tempo}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm" style={{ color: ex.tema.primaria }}>{s.preco}</span>
                <button className="text-white text-xs px-3 py-1.5 rounded-lg" style={{ background: ex.tema.primaria }}>
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
