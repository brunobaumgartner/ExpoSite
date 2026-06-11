import type { Exemplo } from '../../tipos'

const servicos = [
  { emoji: '🩺', nome: 'Clínica Geral',  desc: 'Consultas e check-up completo'          },
  { emoji: '🦷', nome: 'Odontologia',    desc: 'Limpeza, restauração e mais'             },
  { emoji: '🧠', nome: 'Psicologia',     desc: 'Atendimento presencial e online'         },
  { emoji: '💉', nome: 'Vacinas',        desc: 'Calendário completo adulto e infantil'   },
]

export default function TemplateInstitucional({ ex }: { ex: Exemplo }) {
  return (
    <div className="font-sans">
      <div style={{ background: ex.tema.primaria }} className="px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ex.emoji}</span>
          <p className="font-bold text-sm">{ex.negocio}</p>
        </div>
        <nav className="hidden sm:flex gap-4 text-white/80 text-xs">
          <a href="#">Sobre</a><a href="#">Serviços</a><a href="#">Equipe</a><a href="#">Contato</a>
        </nav>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${ex.tema.primaria}, ${ex.tema.secundaria})` }} className="px-8 py-12 text-white text-center">
        <h1 className="text-2xl font-black mb-3">Cuidando da sua saúde com dedicação</h1>
        <p className="text-white/80 text-sm mb-6 max-w-xs mx-auto">
          Atendimento humanizado com toda a tecnologia que você merece.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-white font-bold text-xs px-5 py-2.5 rounded-full" style={{ color: ex.tema.primaria }}>
            Agendar consulta
          </button>
          <button className="border border-white/60 text-white font-bold text-xs px-5 py-2.5 rounded-full">
            Convênios
          </button>
        </div>
      </div>

      <div className="bg-white px-6 py-8">
        <h2 className="text-lg font-bold text-slate-800 text-center mb-6">Especialidades</h2>
        <div className="grid grid-cols-2 gap-3">
          {servicos.map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 transition-colors">
              <span className="text-2xl">{s.emoji}</span>
              <p className="font-semibold text-slate-800 text-sm mt-2">{s.nome}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Contato</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p>📍 Rua das Flores, 120 — Centro</p>
          <p>📞 (11) 3456-7890</p>
          <p>🕐 Seg–Sex 8h–18h · Sáb 8h–12h</p>
        </div>
      </div>
    </div>
  )
}
