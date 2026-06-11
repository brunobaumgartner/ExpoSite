'use client'

import { useState } from 'react'

const planos = {
  mensal: [
    { nome: 'Básico',   preco: '79',  recursos: ['Musculação', 'Cardio', 'Vestiário', 'Estacionamento'] },
    { nome: 'Pro',      preco: '129', recursos: ['Tudo do Básico', 'Aulas em grupo', 'App de treinos', 'Avaliação física'], destaque: true },
    { nome: 'Premium',  preco: '199', recursos: ['Tudo do Pro', 'Personal trainer', 'Nutricionista', 'Acesso 24h'] },
  ],
  anual: [
    { nome: 'Básico',   preco: '63',  recursos: ['Musculação', 'Cardio', 'Vestiário', 'Estacionamento'] },
    { nome: 'Pro',      preco: '99',  recursos: ['Tudo do Básico', 'Aulas em grupo', 'App de treinos', 'Avaliação física'], destaque: true },
    { nome: 'Premium',  preco: '159', recursos: ['Tudo do Pro', 'Personal trainer', 'Nutricionista', 'Acesso 24h'] },
  ],
}

export default function TemplateLandingPage() {
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')

  return (
    <div className="font-sans bg-slate-950 text-white min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black">💪 FitLife</span>
          <div className="hidden md:flex gap-8 text-sm text-slate-400">
            {['Sobre', 'Modalidades', 'Planos', 'Contato'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Começar grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/30 mb-6">
              ⭐ Academia #1 da região
            </span>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Transforme seu corpo.<br />
              <span className="text-blue-400">Transforme sua vida.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Academia completa com treinos personalizados, nutrição e acompanhamento profissional para você alcançar seus objetivos mais rápido.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-3.5 rounded-xl transition-colors">
                Começar agora
              </button>
              <button className="border border-white/20 hover:border-white/40 font-semibold px-6 py-3.5 rounded-xl transition-colors">
                Ver planos →
              </button>
            </div>
            <div className="flex gap-6 mt-10 text-sm text-slate-400">
              <span>✓ Sem fidelidade</span>
              <span>✓ 1ª semana grátis</span>
              <span>✓ Cancele quando quiser</span>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { valor: '1.200+', label: 'Alunos ativos' },
              { valor: '50+',   label: 'Modalidades' },
              { valor: '15',    label: 'Anos de exp.' },
              { valor: '98%',   label: 'Satisfação' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors">
                <p className="text-4xl font-black text-blue-400">{s.valor}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-slate-800 rounded-3xl h-72 flex items-center justify-center text-8xl">
            🏋️
          </div>
          <div>
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Sobre nós</span>
            <h2 className="text-3xl font-black mt-2 mb-4">Muito mais que uma academia</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Fundada em 2010, a FitLife se tornou referência em bem-estar e saúde na cidade. Nossa equipe de profissionais qualificados está pronta para te ajudar em cada etapa da sua jornada.
            </p>
            <div className="space-y-3">
              {[
                { emoji: '🎯', texto: 'Treinos 100% personalizados para seu objetivo' },
                { emoji: '🥗', texto: 'Acompanhamento nutricional incluso no plano Pro' },
                { emoji: '📱', texto: 'App exclusivo com histórico de treinos e evolução' },
                { emoji: '🏆', texto: 'Equipamentos de última geração importados' },
              ].map((i, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{i.emoji}</span>
                  <span className="text-slate-300">{i.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section id="modalidades" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Modalidades</span>
            <h2 className="text-3xl font-black mt-2">Encontre o treino ideal</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">Mais de 50 modalidades para você nunca enjoar de treinar</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '🏋️', nome: 'Musculação',  desc: 'Ganho de massa e definição corporal' },
              { emoji: '🚴', nome: 'Spinning',    desc: 'Cardio intenso e divertido em grupo' },
              { emoji: '🧘', nome: 'Yoga',        desc: 'Flexibilidade, equilíbrio e meditação' },
              { emoji: '🥊', nome: 'Boxe',        desc: 'Defesa pessoal e condicionamento físico' },
              { emoji: '💃', nome: 'Dança',       desc: 'Zumba, funk e street dance' },
              { emoji: '🏊', nome: 'Natação',     desc: 'Hidroginástica e nado livre' },
            ].map((m, i) => (
              <div key={i} className="bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer group">
                <span className="text-3xl">{m.emoji}</span>
                <h3 className="font-bold mt-3 mb-1 group-hover:text-blue-400 transition-colors">{m.nome}</h3>
                <p className="text-slate-400 text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Planos</span>
            <h2 className="text-3xl font-black mt-2">Escolha seu plano</h2>
            <div className="inline-flex items-center gap-1 mt-6 bg-white/5 border border-white/10 rounded-xl p-1">
              {(['mensal', 'anual'] as const).map(c => (
                <button key={c} onClick={() => setCiclo(c)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${ciclo === c ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {c === 'anual' ? <span className="flex items-center gap-2">{c} <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full">-20%</span></span> : c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {planos[ciclo].map((p, i) => (
              <div key={i} className={`rounded-2xl p-7 border relative flex flex-col ${p.destaque ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10'}`}>
                {p.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="font-bold text-lg">{p.nome}</h3>
                <div className="mt-3 mb-5">
                  <span className="text-4xl font-black">R$ {p.preco}</span>
                  <span className={`text-sm ml-1 ${p.destaque ? 'text-blue-200' : 'text-slate-400'}`}>/mês</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.recursos.map((r, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span className={`font-bold ${p.destaque ? 'text-blue-200' : 'text-blue-400'}`}>✓</span>
                      <span className={p.destaque ? 'text-blue-100' : 'text-slate-300'}>{r}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${p.destaque ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  Escolher {p.nome}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black">O que nossos alunos dizem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { nome: 'Ana Souza',    cargo: 'Designer',    texto: 'Perdi 15kg em 4 meses! Os professores são incríveis e o ambiente é super motivador.' },
              { nome: 'Carlos Melo',  cargo: 'Engenheiro',  texto: 'Melhor investimento da minha vida. Personal trainer top e resultado visível em 2 meses.' },
              { nome: 'Fern. Lima',   cargo: 'Professora',  texto: 'As aulas de yoga transformaram minha postura e qualidade de sono. Não troco por nada!' },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4 text-yellow-400 text-sm">★★★★★</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/40 flex items-center justify-center text-sm font-bold text-blue-300">
                    {t.nome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.nome}</p>
                    <p className="text-slate-400 text-xs">{t.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Contato */}
      <section id="contato" className="py-24 bg-slate-900 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Primeira semana grátis</h2>
          <p className="text-slate-400 text-lg mb-8">Sem compromisso. Venha conhecer e se apaixonar.</p>
          <button className="bg-blue-600 hover:bg-blue-500 font-bold px-10 py-4 rounded-2xl text-lg transition-colors w-full sm:w-auto">
            Garantir minha vaga
          </button>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 text-sm text-slate-500">
            <span>📍 Rua das Flores, 123 — Centro</span>
            <span>📞 (11) 99999-0000</span>
            <span>🕐 06h – 23h todos os dias</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span className="font-black text-white text-base">💪 FitLife Academia</span>
          <p>© 2025 FitLife. Site criado com <span className="text-violet-400">ExpoSite</span>.</p>
        </div>
      </footer>
    </div>
  )
}
