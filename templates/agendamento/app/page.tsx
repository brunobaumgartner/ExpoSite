import rawConfig from '../site.config.json'

type Servico = { nome: string; duracao?: string; preco?: string; descricao?: string }
type Config = {
  nome_negocio: string; slogan?: string; descricao?: string
  telefone?: string; whatsapp?: string; endereco?: string
  cor_primaria?: string; cor_secundaria?: string
  horario?: string; instagram?: string; servicos?: Servico[]
}

const c   = rawConfig as Config
const cor1 = c.cor_primaria  ?? '#18181b'
const cor2 = c.cor_secundaria ?? cor1
const wa   = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : null
const waMsg = (s: string) => wa ? `${wa}?text=${encodeURIComponent(`Olá! Gostaria de agendar: ${s}`)}` : '#'

export default function Page() {
  return (
    <div className="font-sans antialiased bg-white">

      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 shadow" style={{ backgroundColor: cor1 }}>
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-white text-xl font-bold">{c.nome_negocio}</span>
          {c.horario && <span className="hidden md:block text-white/60 text-sm">🕐 {c.horario}</span>}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full transition">
              Agendar agora
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-[60vh] flex items-center text-white"
               style={{ background: `linear-gradient(160deg, ${cor1} 60%, ${cor2} 100%)` }}>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-3">{c.nome_negocio}</h1>
          {c.slogan && <p className="text-xl text-white/80 mb-2">{c.slogan}</p>}
          {c.descricao && <p className="text-base text-white/60 mb-8 max-w-xl mx-auto">{c.descricao}</p>}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-full text-lg transition shadow-xl">
              💬 Agendar pelo WhatsApp
            </a>
          )}
          {c.horario && <p className="mt-6 text-white/40 text-sm">⏰ {c.horario}</p>}
        </div>
      </section>

      {/* Serviços */}
      {c.servicos && c.servicos.length > 0 && (
        <section id="servicos" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossos Serviços</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {c.servicos.map((s, i) => (
                <a key={i} href={waMsg(s.nome)} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition group">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-black">{s.nome}</h3>
                    {s.descricao && <p className="text-gray-500 text-sm mt-1">{s.descricao}</p>}
                    {s.duracao && <p className="text-gray-400 text-xs mt-1">⏱ {s.duracao}</p>}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    {s.preco && <p className="text-xl font-black" style={{ color: cor1 }}>{s.preco}</p>}
                    <span className="text-xs text-green-600 font-medium">Agendar →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Como Agendar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '💬', titulo: 'Envie uma mensagem', desc: 'Fale conosco pelo WhatsApp e escolha o serviço desejado' },
              { emoji: '📅', titulo: 'Confirme o horário', desc: 'Escolha o dia e horário que melhor se encaixa na sua agenda' },
              { emoji: '✅', titulo: 'Apareça e pronto!', desc: 'No dia marcado é só chegar que te atendemos na hora' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <span className="text-4xl">{step.emoji}</span>
                <h3 className="font-bold text-gray-900">{step.titulo}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 text-white text-center" style={{ backgroundColor: cor1 }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-bold mb-6">{c.nome_negocio}</h2>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {c.telefone && <span className="bg-white/10 px-4 py-2 rounded-full">📞 {c.telefone}</span>}
            {c.endereco && <span className="bg-white/10 px-4 py-2 rounded-full">📍 {c.endereco}</span>}
            {c.horario  && <span className="bg-white/10 px-4 py-2 rounded-full">⏰ {c.horario}</span>}
            {c.instagram && <span className="bg-white/10 px-4 py-2 rounded-full">📸 {c.instagram}</span>}
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="inline-block mt-8 bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-full text-lg transition">
              💬 Agendar agora
            </a>
          )}
          <p className="text-white/20 text-xs mt-8">Site criado com ExpoSite</p>
        </div>
      </section>
    </div>
  )
}
