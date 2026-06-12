import rawConfig from '../site.config.json'

type Servico = { nome: string; descricao?: string }
type Membro  = { nome: string; cargo?: string; especialidade?: string }
type Config  = {
  nome_negocio: string; slogan?: string; descricao?: string
  telefone?: string; whatsapp?: string; endereco?: string
  cor_primaria?: string; cor_secundaria?: string
  horario?: string; instagram?: string
  servicos?: Servico[]; equipe?: Membro[]
}

const c    = rawConfig as Config
const cor1  = c.cor_primaria  ?? '#0d9488'
const cor2  = c.cor_secundaria ?? cor1
const wa    = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : null

export default function Page() {
  return (
    <div className="font-sans antialiased">

      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: cor1 }}>{c.nome_negocio}</span>
          <div className="hidden md:flex gap-6 text-sm text-gray-600">
            {c.servicos?.length ? <a href="#servicos" className="hover:text-gray-900">Serviços</a> : null}
            {c.equipe?.length   ? <a href="#equipe"   className="hover:text-gray-900">Equipe</a>   : null}
            <a href="#contato" className="hover:text-gray-900">Contato</a>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="text-white text-sm font-bold px-4 py-2 rounded-full transition hover:opacity-90"
               style={{ backgroundColor: cor1 }}>
              Agendar consulta
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 py-28 text-white"
               style={{ background: `linear-gradient(135deg, ${cor1} 0%, ${cor2} 100%)` }}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-3">{c.nome_negocio}</h1>
          {c.slogan    && <p className="text-xl text-white/85 mb-3">{c.slogan}</p>}
          {c.descricao && <p className="text-base text-white/65 mb-8 max-w-2xl mx-auto leading-relaxed">{c.descricao}</p>}
          <div className="flex flex-wrap gap-4 justify-center">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                 className="bg-white font-bold px-8 py-4 rounded-full text-lg transition hover:opacity-90 shadow-xl"
                 style={{ color: cor1 }}>
                💬 Agendar agora
              </a>
            )}
            {c.telefone && (
              <a href={`tel:${c.telefone}`}
                 className="bg-white/15 hover:bg-white/25 text-white font-bold px-8 py-4 rounded-full text-lg transition border border-white/30">
                📞 {c.telefone}
              </a>
            )}
          </div>
          {c.horario && <p className="mt-8 text-white/40 text-sm">⏰ {c.horario}</p>}
        </div>
      </section>

      {/* Serviços */}
      {c.servicos && c.servicos.length > 0 && (
        <section id="servicos" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossos Serviços</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {c.servicos.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white font-bold"
                       style={{ backgroundColor: cor1 }}>
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.nome}</h3>
                  {s.descricao && <p className="text-gray-500 text-sm leading-relaxed">{s.descricao}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Equipe */}
      {c.equipe && c.equipe.length > 0 && (
        <section id="equipe" className="py-24 bg-white">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossa Equipe</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {c.equipe.map((m, i) => (
                <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold"
                       style={{ backgroundColor: cor1 }}>
                    {m.nome.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-900">{m.nome}</h3>
                  {m.cargo && <p className="text-sm font-medium mt-1" style={{ color: cor1 }}>{m.cargo}</p>}
                  {m.especialidade && <p className="text-xs text-gray-400 mt-1">{m.especialidade}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contato */}
      <section id="contato" className="py-16 text-white" style={{ backgroundColor: cor1 }}>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold mb-8">Entre em Contato</h2>
          <div className="flex flex-wrap gap-4 justify-center text-sm mb-8">
            {c.telefone && <a href={`tel:${c.telefone}`}        className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition">📞 {c.telefone}</a>}
            {c.endereco && <span className="bg-white/10 px-5 py-3 rounded-xl">📍 {c.endereco}</span>}
            {c.horario  && <span className="bg-white/10 px-5 py-3 rounded-xl">⏰ {c.horario}</span>}
            {c.instagram && <span className="bg-white/10 px-5 py-3 rounded-xl">📸 {c.instagram}</span>}
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="inline-block bg-white font-bold px-10 py-4 rounded-full text-lg transition hover:opacity-90"
               style={{ color: cor1 }}>
              💬 Agendar pelo WhatsApp
            </a>
          )}
          <p className="text-white/20 text-xs mt-8">Site criado com ExpoSite</p>
        </div>
      </section>
    </div>
  )
}
