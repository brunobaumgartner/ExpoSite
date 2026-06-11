'use client'

import { useState } from 'react'

const especialidades = [
  { emoji: '🩺', nome: 'Clínica Geral',    desc: 'Consultas de rotina, check-up completo e acompanhamento contínuo de saúde.' },
  { emoji: '❤️', nome: 'Cardiologia',       desc: 'Eletrocardiograma, Holter, ecocardiograma e acompanhamento cardiovascular.' },
  { emoji: '🧠', nome: 'Psicologia',        desc: 'Terapia individual, de casal e familiar. Presencial e online.' },
  { emoji: '🦴', nome: 'Ortopedia',         desc: 'Lesões, fraturas, tendinites e tratamentos pós-cirúrgicos.' },
  { emoji: '🦷', nome: 'Odontologia',       desc: 'Limpeza, restauração, clareamento e tratamento de canal.' },
  { emoji: '💉', nome: 'Vacinas',           desc: 'Calendário completo adulto e infantil, com agendamento rápido.' },
  { emoji: '👁️', nome: 'Oftalmologia',      desc: 'Exame de vista, adaptação de lentes e cirurgias de correção.' },
  { emoji: '🤰', nome: 'Ginecologia',       desc: 'Pré-natal, preventivo, planejamento familiar e saúde da mulher.' },
]

const equipe = [
  { nome: 'Dr. Ricardo Silva',    especialidade: 'Clínica Geral',  formacao: 'CRM 12345 · USP',      emoji: '👨‍⚕️', nota: 4.9 },
  { nome: 'Dra. Amanda Costa',   especialidade: 'Cardiologia',    formacao: 'CRM 23456 · UNIFESP',   emoji: '👩‍⚕️', nota: 5.0 },
  { nome: 'Dr. Paulo Mendes',    especialidade: 'Ortopedia',      formacao: 'CRM 34567 · UNICAMP',   emoji: '👨‍⚕️', nota: 4.8 },
  { nome: 'Dra. Carla Rocha',    especialidade: 'Psicologia',     formacao: 'CRP 45678 · PUC',       emoji: '👩‍⚕️', nota: 4.9 },
]

const convenios = ['Unimed', 'Bradesco Saúde', 'Amil', 'SulAmérica', 'Porto Seguro', 'Hapvida', 'NotreDame', 'Particular']

export default function TemplateInstitucional() {
  const [form, setForm]   = useState({ nome: '', email: '', telefone: '', especialidade: '', mensagem: '' })
  const [enviado, setEnviado] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="font-sans bg-white text-slate-900 min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-black text-teal-700 flex items-center gap-2">🏥 Clínica Dr. Silva</span>
          <div className="hidden md:flex gap-8 text-sm text-slate-500">
            {['Especialidades', 'Equipe', 'Convênios', 'Contato'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-teal-600 transition-colors">{l}</a>
            ))}
          </div>
          <button className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            Agendar consulta
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-500/30">
              ✓ Mais de 20 anos de excelência médica
            </span>
            <h1 className="text-5xl font-black mt-4 mb-5 leading-tight">
              Cuidando da sua saúde com dedicação
            </h1>
            <p className="text-teal-100 text-lg leading-relaxed mb-8">
              Equipe multidisciplinar, tecnologia de ponta e atendimento humanizado. Sua saúde em boas mãos.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-teal-700 font-bold px-6 py-3.5 rounded-xl hover:bg-teal-50 transition-colors">
                Agendar consulta
              </button>
              <button className="border border-white/30 hover:border-white/60 font-semibold px-6 py-3.5 rounded-xl transition-colors">
                Nossos convênios
              </button>
            </div>
            <div className="flex gap-6 mt-8 text-sm text-teal-300">
              <span>🏆 ISO 9001 Certificada</span>
              <span>👨‍⚕️ 30+ especialistas</span>
              <span>⭐ 4.9 no Google</span>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { emoji: '🏥', label: 'Estrutura moderna', desc: '3 andares, 40 consultórios' },
              { emoji: '⏱️', label: 'Consultas rápidas', desc: 'Espera máx. 15 min' },
              { emoji: '📅', label: 'Agendamento online', desc: 'Disponível 24h' },
              { emoji: '🚑', label: 'Pronto-atendimento', desc: 'Seg–Sex 8h–20h' },
            ].map((c, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors">
                <span className="text-3xl">{c.emoji}</span>
                <p className="font-bold mt-2 text-sm">{c.label}</p>
                <p className="text-teal-300 text-xs mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section id="especialidades" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">Especialidades</span>
            <h2 className="text-3xl font-black mt-2">Atendimento completo para você</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Mais de 20 especialidades em um só lugar, com profissionais altamente qualificados</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {especialidades.map((e, i) => (
              <div key={i} className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 transition-all hover:-translate-y-0.5 cursor-pointer group">
                <span className="text-3xl">{e.emoji}</span>
                <h3 className="font-bold mt-3 mb-1 text-sm group-hover:text-teal-600 transition-colors">{e.nome}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section id="equipe" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">Equipe</span>
            <h2 className="text-3xl font-black mt-2">Conheça nossos especialistas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipe.map((m, i) => (
              <div key={i} className="text-center group">
                <div className="w-24 h-24 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-5xl mx-auto mb-4 group-hover:border-teal-400 transition-colors">
                  {m.emoji}
                </div>
                <p className="font-black">{m.nome}</p>
                <p className="text-teal-600 text-sm font-semibold mt-0.5">{m.especialidade}</p>
                <p className="text-slate-400 text-xs mt-0.5">{m.formacao}</p>
                <p className="text-yellow-500 text-sm mt-1">{'★'.repeat(5)} <span className="text-slate-400">({m.nota})</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convênios */}
      <section id="convênios" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">Convênios</span>
            <h2 className="text-3xl font-black mt-2">Aceitamos seu plano de saúde</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {convenios.map((c, i) => (
              <span key={i} className={`px-5 py-2.5 rounded-xl font-semibold text-sm border ${c === 'Particular' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 transition-colors'}`}>
                {c}
              </span>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">Não encontrou seu convênio? Entre em contato — aceitamos mais de 30 planos.</p>
        </div>
      </section>

      {/* Contato + Formulário */}
      <section id="contato" className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">Contato</span>
            <h2 className="text-3xl font-black mt-2 mb-6">Agende sua consulta</h2>
            <div className="space-y-4 text-slate-600">
              {[
                { emoji: '📍', info: 'Rua das Flores, 120, Sala 301', sub: 'Centro — São Paulo, SP' },
                { emoji: '📞', info: '(11) 3456-7890', sub: 'Seg–Sex 8h–20h · Sáb 8h–13h' },
                { emoji: '📱', info: '(11) 99999-0000', sub: 'WhatsApp disponível' },
                { emoji: '📧', info: 'contato@clinicasilva.com.br', sub: 'Respondemos em até 2h' },
              ].map((c, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-2xl mt-0.5">{c.emoji}</span>
                  <div>
                    <p className="font-semibold">{c.info}</p>
                    <p className="text-slate-400 text-sm">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            {enviado ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-black text-teal-700 mb-2">Mensagem enviada!</h3>
                <p className="text-slate-500 text-sm">Entraremos em contato em até 2 horas úteis.</p>
                <button onClick={() => setEnviado(false)} className="mt-4 text-teal-600 hover:underline text-sm">Enviar nova mensagem</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setEnviado(true) }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome</label>
                    <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white" placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
                    <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                      required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white" placeholder="(11) 9..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidade</label>
                  <select value={form.especialidade} onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white text-slate-700">
                    <option value="">Selecione...</option>
                    {especialidades.map(e => <option key={e.nome} value={e.nome}>{e.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mensagem (opcional)</label>
                  <textarea value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white resize-none" placeholder="Conte-nos um pouco sobre sua necessidade..." />
                </div>
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition-colors">
                  Solicitar agendamento
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-black text-white text-base">🏥 Clínica Dr. Silva</span>
          <p>CRM/SP 12345 · ANVISA 67890 · Todos os direitos reservados</p>
          <p>Site criado com <span className="text-violet-400">ExpoSite</span></p>
        </div>
      </footer>
    </div>
  )
}
