'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Exemplo = {
  tipo: 'Landing Page' | 'Agendamento' | 'Cardápio' | 'E-commerce' | 'Institucional'
  negocio: string
  emoji: string
  cor: string
  slug: string
  tema: { primaria: string; secundaria: string; texto: string }
}

const exemplos: Exemplo[] = [
  { tipo: 'Landing Page', negocio: 'Academia FitLife', emoji: '💪', cor: 'from-blue-500 to-blue-700', slug: 'fitlife', tema: { primaria: '#2563eb', secundaria: '#1e40af', texto: '#eff6ff' } },
  { tipo: 'Agendamento',  negocio: 'Barbearia do João', emoji: '✂️', cor: 'from-slate-700 to-slate-900', slug: 'barbearia-joao', tema: { primaria: '#1e293b', secundaria: '#0f172a', texto: '#f8fafc' } },
  { tipo: 'Cardápio',     negocio: 'Pizzaria Bella', emoji: '🍕', cor: 'from-red-500 to-red-700', slug: 'pizzaria-bella', tema: { primaria: '#dc2626', secundaria: '#991b1b', texto: '#fff1f2' } },
  { tipo: 'E-commerce',   negocio: 'Loja da Maria', emoji: '👗', cor: 'from-pink-500 to-pink-700', slug: 'loja-maria', tema: { primaria: '#db2777', secundaria: '#9d174d', texto: '#fdf2f8' } },
  { tipo: 'Institucional',negocio: 'Clínica Dr. Silva', emoji: '🏥', cor: 'from-teal-500 to-teal-700', slug: 'clinica-silva', tema: { primaria: '#0d9488', secundaria: '#0f766e', texto: '#f0fdfa' } },
  { tipo: 'Landing Page', negocio: 'Adv. Santos & Ass.', emoji: '⚖️', cor: 'from-amber-600 to-amber-800', slug: 'adv-santos', tema: { primaria: '#d97706', secundaria: '#92400e', texto: '#fffbeb' } },
]

// ─── Templates ──────────────────────────────────────────────────────────────

function TemplateLandingPage({ ex }: { ex: Exemplo }) {
  const isLaw = ex.slug === 'adv-santos'
  return (
    <div className="font-sans text-slate-800">
      <div style={{ background: `linear-gradient(135deg, ${ex.tema.primaria}, ${ex.tema.secundaria})` }} className="px-8 py-14 text-center text-white">
        <div className="text-5xl mb-4">{ex.emoji}</div>
        <h1 className="text-3xl font-black mb-3">{ex.negocio}</h1>
        <p className="text-white/80 text-base mb-6 max-w-sm mx-auto">
          {isLaw ? 'Defendendo seus direitos com excelência e dedicação há 20 anos.' : 'Transforme seu corpo e sua vida em 90 dias com método comprovado.'}
        </p>
        <button className="bg-white font-bold px-8 py-3 rounded-full text-sm shadow-lg" style={{ color: ex.tema.primaria }}>
          {isLaw ? 'Consulta gratuita' : 'Começar agora'}
        </button>
      </div>
      <div className="bg-white px-8 py-10">
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">
          {isLaw ? 'Áreas de atuação' : 'Por que nos escolher?'}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(isLaw
            ? ['⚖️ Direito Civil', '🏠 Direito Imobiliário', '💼 Direito Trabalhista']
            : ['🏋️ Treinos personalizados', '🥗 Dieta inclusa', '📱 Acompanhamento diário']
          ).map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ background: ex.tema.texto }}>
              <p className="font-semibold text-slate-700 text-xs">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-50 px-8 py-10">
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Depoimentos</h2>
        <div className="grid grid-cols-2 gap-4">
          {(isLaw
            ? [{ nome: 'Roberto A.', texto: 'Ganhamos a causa! Excelente profissional.' }, { nome: 'Fernanda L.', texto: 'Muito competente e atencioso.' }]
            : [{ nome: 'Ana S.', texto: 'Perdi 12kg em 3 meses! Incrível!' }, { nome: 'Carlos M.', texto: 'Melhor academia da cidade!' }]
          ).map((t, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-slate-600 text-xs italic mb-2">"{t.texto}"</p>
              <p className="text-xs font-semibold" style={{ color: ex.tema.primaria }}>— {t.nome}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-8 py-10 text-center text-white" style={{ background: ex.tema.primaria }}>
        <h2 className="text-xl font-black mb-3">{isLaw ? 'Agende uma consulta' : 'Primeira semana grátis!'}</h2>
        <button className="bg-white font-bold px-8 py-3 rounded-full text-sm" style={{ color: ex.tema.primaria }}>
          {isLaw ? 'Falar com advogado' : 'Garantir minha vaga'}
        </button>
      </div>
    </div>
  )
}

function TemplateAgendamento({ ex }: { ex: Exemplo }) {
  const horarios = ['09:00', '09:30', '10:00', '11:00', '14:00', '15:30', '16:00']
  const ocupados = [1, 3, 5]
  const servicos = [
    { nome: 'Corte simples', preco: 'R$ 30', tempo: '30 min' },
    { nome: 'Corte + barba', preco: 'R$ 50', tempo: '60 min' },
    { nome: 'Barba completa', preco: 'R$ 25', tempo: '30 min' },
    { nome: 'Pigmentação', preco: 'R$ 80', tempo: '90 min' },
  ]
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
        <div className="flex gap-1.5 mb-1 overflow-x-auto pb-1">
          {['Seg 9', 'Ter 10', 'Qua 11', 'Qui 12', 'Sex 13'].map((d, i) => (
            <button key={i} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border ${i === 2 ? 'text-white border-transparent' : 'text-slate-600 border-slate-200'}`}
              style={i === 2 ? { background: ex.tema.primaria } : {}}>
              {d}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {horarios.map((h, i) => (
            <button key={i} disabled={ocupados.includes(i)}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${ocupados.includes(i) ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed' : i === 2 ? 'text-white border-transparent' : 'text-slate-700 border-slate-200 hover:border-current'}`}
              style={i === 2 && !ocupados.includes(i) ? { background: ex.tema.primaria } : {}}>
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
                <button className="text-white text-xs px-3 py-1.5 rounded-lg" style={{ background: ex.tema.primaria }}>Agendar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TemplateCardapio({ ex }: { ex: Exemplo }) {
  const [aba, setAba] = useState(0)
  const categorias = ['Pizzas', 'Massas', 'Bebidas', 'Sobremesas']
  const itens = [
    [
      { nome: 'Margherita', desc: 'Molho, mussarela, manjericão', preco: 'R$ 42' },
      { nome: 'Calabresa', desc: 'Calabresa, cebola, azeitona', preco: 'R$ 39' },
      { nome: 'Frango c/ Catupiry', desc: 'Frango desfiado, catupiry', preco: 'R$ 46' },
      { nome: 'Portuguesa', desc: 'Presunto, ovo, azeitona, ervilha', preco: 'R$ 44' },
    ],
    [
      { nome: 'Lasanha Bolonhesa', desc: 'Carne moída, molho bechamel', preco: 'R$ 38' },
      { nome: 'Nhoque ao Sugo', desc: 'Molho de tomate fresco', preco: 'R$ 29' },
    ],
    [
      { nome: 'Refrigerante Lata', desc: 'Coca, Guaraná, Fanta', preco: 'R$ 7' },
      { nome: 'Suco Natural', desc: 'Laranja, limão, abacaxi', preco: 'R$ 12' },
      { nome: 'Água', desc: 'Com ou sem gás 500ml', preco: 'R$ 5' },
    ],
    [
      { nome: 'Tiramisu', desc: 'Receita italiana original', preco: 'R$ 18' },
      { nome: 'Pudim', desc: 'Caseiro com calda de caramelo', preco: 'R$ 12' },
    ],
  ]
  return (
    <div className="font-sans">
      <div style={{ background: ex.tema.primaria }} className="px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{ex.emoji}</span>
          <div>
            <h1 className="font-black text-lg">{ex.negocio}</h1>
            <p className="text-white/70 text-xs">Aberto agora · Entrega 40 min</p>
          </div>
        </div>
      </div>
      <div style={{ background: ex.tema.secundaria }} className="px-6 py-0">
        <div className="flex gap-0">
          {categorias.map((c, i) => (
            <button key={i} onClick={() => setAba(i)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${aba === i ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white px-6 py-5 space-y-3">
        {itens[aba].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-red-200 transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">{item.nome}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="font-bold text-sm" style={{ color: ex.tema.primaria }}>{item.preco}</span>
              <button className="w-7 h-7 rounded-full text-white text-lg leading-none flex items-center justify-center" style={{ background: ex.tema.primaria }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TemplateEcommerce({ ex }: { ex: Exemplo }) {
  const produtos = [
    { nome: 'Blusa Floral', preco: 'R$ 89', parcela: '3x R$ 29', emoji: '👚', destaque: true },
    { nome: 'Saia Midi', preco: 'R$ 129', parcela: '4x R$ 32', emoji: '👗', destaque: false },
    { nome: 'Vestido Leve', preco: 'R$ 159', parcela: '5x R$ 31', emoji: '👘', destaque: true },
    { nome: 'Calça Jeans', preco: 'R$ 149', parcela: '5x R$ 29', emoji: '👖', destaque: false },
    { nome: 'Cardigan', preco: 'R$ 99', parcela: '3x R$ 33', emoji: '🧥', destaque: false },
    { nome: 'Bolsa Tote', preco: 'R$ 79', parcela: '2x R$ 39', emoji: '👜', destaque: true },
  ]
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
          <button key={i} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${i === 0 ? 'text-white border-transparent' : 'border-slate-300 text-slate-600'}`}
            style={i === 0 ? { background: ex.tema.primaria } : {}}>
            {c}
          </button>
        ))}
      </div>
      <div className="bg-white px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {produtos.map((p, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow">
              {p.destaque && <div className="text-white text-xs font-bold px-2 py-0.5" style={{ background: ex.tema.primaria }}>⭐ Destaque</div>}
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

function TemplateInstitucional({ ex }: { ex: Exemplo }) {
  const servicos = [
    { emoji: '🩺', nome: 'Clínica Geral', desc: 'Consultas e check-up completo' },
    { emoji: '🦷', nome: 'Odontologia', desc: 'Limpeza, restauração e mais' },
    { emoji: '🧠', nome: 'Psicologia', desc: 'Atendimento presencial e online' },
    { emoji: '💉', nome: 'Vacinas', desc: 'Calendário completo adulto e infantil' },
  ]
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
        <p className="text-white/80 text-sm mb-6 max-w-xs mx-auto">Atendimento humanizado com toda a tecnologia que você merece.</p>
        <div className="flex gap-3 justify-center">
          <button className="bg-white font-bold text-xs px-5 py-2.5 rounded-full" style={{ color: ex.tema.primaria }}>Agendar consulta</button>
          <button className="border border-white/60 text-white font-bold text-xs px-5 py-2.5 rounded-full">Convênios</button>
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

function TemplateConteudo({ ex }: { ex: Exemplo }) {
  switch (ex.tipo) {
    case 'Landing Page':   return <TemplateLandingPage ex={ex} />
    case 'Agendamento':    return <TemplateAgendamento ex={ex} />
    case 'Cardápio':       return <TemplateCardapio ex={ex} />
    case 'E-commerce':     return <TemplateEcommerce ex={ex} />
    case 'Institucional':  return <TemplateInstitucional ex={ex} />
  }
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function ModalTemplate({ ex, onFechar }: { ex: Exemplo; onFechar: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onFechar}
    >
      <motion.div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Chrome do navegador */}
        <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-3 border-b border-slate-200">
          <div className="flex gap-1.5">
            <button onClick={onFechar} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono flex items-center gap-1">
            <span className="text-slate-300">🔒</span> {ex.slug}.exposite.com.br
          </div>
          <span className="text-xs text-slate-400 font-medium">{ex.tipo}</span>
        </div>
        {/* Conteúdo do template */}
        <div className="h-[72vh] overflow-y-auto overscroll-contain">
          <TemplateConteudo ex={ex} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Seção principal ────────────────────────────────────────────────────────

export default function Portfolio() {
  const [selecionado, setSelecionado] = useState<Exemplo | null>(null)

  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Exemplos reais</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Portfólio</h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Clique em qualquer exemplo para ver o template completo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exemplos.map((ex, i) => (
            <button
              key={i}
              onClick={() => setSelecionado(ex)}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group text-left w-full"
            >
              <div className={`bg-gradient-to-br ${ex.cor} h-48 flex flex-col items-center justify-center text-white`}>
                <span className="text-6xl mb-2 group-hover:scale-110 transition-transform">{ex.emoji}</span>
                <span className="text-sm font-medium opacity-80">{ex.tipo}</span>
              </div>
              <div className="bg-white p-4 flex items-center justify-between">
                <p className="font-semibold text-slate-800 text-sm">{ex.negocio}</p>
                <span className="text-xs text-slate-400 group-hover:text-violet-600 transition-colors">Ver template →</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          * Demonstrações. Portfólio real disponível após o lançamento.
        </p>
      </div>

      <AnimatePresence>
        {selecionado && (
          <ModalTemplate ex={selecionado} onFechar={() => setSelecionado(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
