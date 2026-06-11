'use client'

import { useState } from 'react'

const servicos = [
  { nome: 'Corte simples',     preco: 30,  tempo: '30 min', emoji: '✂️' },
  { nome: 'Corte + barba',     preco: 50,  tempo: '60 min', emoji: '🪒' },
  { nome: 'Barba completa',    preco: 35,  tempo: '40 min', emoji: '🧔' },
  { nome: 'Degradê navalhado', preco: 55,  tempo: '50 min', emoji: '💈' },
  { nome: 'Sobrancelha',       preco: 20,  tempo: '20 min', emoji: '👁️' },
  { nome: 'Pigmentação',       preco: 120, tempo: '90 min', emoji: '🎨' },
]

const barbeiros = [
  { nome: 'João Silva',     especialidade: 'Degradê e Navalhados', emoji: '👨‍🦱', nota: 4.9 },
  { nome: 'Pedro Alves',    especialidade: 'Barba e Cuidados',     emoji: '🧑‍🦲', nota: 4.8 },
  { nome: 'Lucas Ferreira', especialidade: 'Cortes Modernos',      emoji: '👨‍🦳', nota: 4.9 },
]

const diasSemana = ['Seg\n09', 'Ter\n10', 'Qua\n11', 'Qui\n12', 'Sex\n13', 'Sáb\n14']
const horariosDisp = ['09:00', '09:30', '10:30', '11:00', '14:00', '14:30', '16:00', '16:30', '17:00']
const ocupados = [1, 4, 6]

export default function TemplateAgendamento() {
  const [servicoSel, setServicoSel] = useState<number | null>(null)
  const [diaSel, setDiaSel]         = useState(2)
  const [horaSel, setHoraSel]       = useState<number | null>(null)
  const [barb, setBarb]             = useState(0)
  const [confirmado, setConfirmado] = useState(false)

  const totalStr = servicoSel !== null ? `R$ ${servicos[servicoSel].preco}` : '—'

  function confirmar() {
    if (servicoSel === null || horaSel === null) return
    setConfirmado(true)
  }

  return (
    <div className="font-sans bg-white text-slate-900 min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-black flex items-center gap-2">💈 Barbearia do João</span>
          <div className="hidden md:flex gap-8 text-sm text-slate-300">
            {['Serviços', 'Equipe', 'Galeria', 'Contato'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            Agendar agora
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Desde 2008</span>
            <h1 className="text-5xl font-black mt-3 mb-5 leading-tight">
              A melhor experiência<br />de barbearia da cidade
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Tradição, estilo e qualidade. Cada corte é feito com cuidado e dedicação para você sair perfeito.
            </p>
            <div className="flex gap-3">
              <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl transition-colors">
                Agendar corte
              </button>
              <button className="border border-white/20 hover:border-white/40 font-semibold px-6 py-3.5 rounded-xl transition-colors">
                Ver serviços
              </button>
            </div>
            <div className="flex gap-6 mt-8 text-sm text-slate-400">
              <span>⭐ 4.9 no Google</span>
              <span>💈 +3.000 clientes</span>
              <span>✂️ 15 anos de exp.</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <div className="bg-white/10 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-4xl">💈</span>
              <div>
                <p className="font-bold">Próximo horário disponível</p>
                <p className="text-amber-400 font-semibold text-sm">Hoje às 14:00</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['✂️', 'Corte'], ['🪒', 'Barba'], ['🎨', 'Pigmentação']].map(([e, n], i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="text-2xl">{e}</span>
                  <p className="text-xs text-slate-300 mt-1">{n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="serviços" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Serviços</span>
            <h2 className="text-3xl font-black mt-2">O que oferecemos</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicos.map((s, i) => (
              <button key={i} onClick={() => setServicoSel(servicoSel === i ? null : i)}
                className={`p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 ${servicoSel === i ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-slate-200 bg-white hover:border-amber-300'}`}>
                <span className="text-3xl">{s.emoji}</span>
                <div className="flex items-start justify-between mt-3">
                  <div>
                    <p className="font-bold text-slate-900">{s.nome}</p>
                    <p className="text-slate-400 text-sm">{s.tempo}</p>
                  </div>
                  <span className="font-black text-amber-600 text-lg">R$ {s.preco}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section id="equipe" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Equipe</span>
            <h2 className="text-3xl font-black mt-2">Nossos barbeiros</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {barbeiros.map((b, i) => (
              <button key={i} onClick={() => setBarb(i)}
                className={`p-6 rounded-2xl border-2 text-center transition-all ${barb === i ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${barb === i ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {b.emoji}
                </div>
                <p className="font-black text-lg">{b.nome}</p>
                <p className={`text-sm mt-1 ${barb === i ? 'text-slate-300' : 'text-slate-500'}`}>{b.especialidade}</p>
                <p className="text-amber-400 font-semibold text-sm mt-2">⭐ {b.nota}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agendamento */}
      <section id="contato" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Agendamento</span>
            <h2 className="text-3xl font-black mt-2">Escolha data e hora</h2>
          </div>

          {confirmado ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-green-700 mb-2">Agendamento confirmado!</h3>
              <p className="text-slate-600">
                {servicos[servicoSel!].nome} com {barbeiros[barb].nome}<br />
                {diasSemana[diaSel].replace('\n', ' de junho')} às {horariosDisp[horaSel!]}
              </p>
              <button onClick={() => { setConfirmado(false); setHoraSel(null); setServicoSel(null) }}
                className="mt-6 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl">
                Fazer novo agendamento
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div>
                <p className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">1. Serviço selecionado</p>
                <p className={`text-sm font-semibold ${servicoSel !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                  {servicoSel !== null ? `${servicos[servicoSel].emoji} ${servicos[servicoSel].nome} — ${totalStr}` : 'Selecione um serviço acima'}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">2. Escolha o dia</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {diasSemana.map((d, i) => (
                    <button key={i} onClick={() => { setDiaSel(i); setHoraSel(null) }}
                      className={`shrink-0 w-14 h-14 rounded-xl text-xs font-bold leading-tight transition-colors ${diaSel === i ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {d.split('\n').map((l, j) => <span key={j} className="block">{l}</span>)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">3. Escolha o horário</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {horariosDisp.map((h, i) => (
                    <button key={i} disabled={ocupados.includes(i)} onClick={() => setHoraSel(i)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        ocupados.includes(i) ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        : horaSel === i ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-900'
                      }`}>
                      {ocupados.includes(i) ? 'Lotado' : h}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={confirmar}
                disabled={servicoSel === null || horaSel === null}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-black py-4 rounded-xl text-base transition-colors">
                Confirmar agendamento
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-black text-white text-base">💈 Barbearia do João</span>
          <p>📍 Rua XV de Novembro, 456 · (11) 98765-4321 · Seg–Sáb 9h–19h</p>
          <p>Site criado com <span className="text-violet-400">ExpoSite</span></p>
        </div>
      </footer>
    </div>
  )
}
