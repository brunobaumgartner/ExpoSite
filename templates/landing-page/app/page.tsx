import rawConfig from '../site.config.json'

type Servico = { nome: string; descricao?: string; preco?: string }
type Config = {
  nome_negocio: string
  slogan?: string
  descricao?: string
  telefone?: string
  whatsapp?: string
  endereco?: string
  cor_primaria?: string
  cor_secundaria?: string
  instagram?: string
  servicos?: Servico[]
}

const c = rawConfig as Config
const cor1 = c.cor_primaria  ?? '#2563eb'
const cor2 = c.cor_secundaria ?? cor1
const wa   = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : null
const tel  = c.telefone ? `tel:${c.telefone}` : null

export default function Page() {
  return (
    <div className="font-sans antialiased">

      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 shadow-md" style={{ backgroundColor: cor1 }}>
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-white text-xl font-bold tracking-tight">{c.nome_negocio}</span>
          <div className="hidden md:flex gap-6 text-sm text-white/80">
            {c.servicos && c.servicos.length > 0 && <a href="#servicos" className="hover:text-white">Serviços</a>}
            <a href="#contato" className="hover:text-white">Contato</a>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="hidden md:block bg-white text-sm font-semibold px-4 py-2 rounded-full transition hover:opacity-90"
               style={{ color: cor1 }}>
              WhatsApp ↗
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center text-white"
               style={{ background: `linear-gradient(135deg, ${cor1} 0%, ${cor2} 100%)` }}>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-4">{c.nome_negocio}</h1>
          {c.slogan && <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">{c.slogan}</p>}
          {c.descricao && <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">{c.descricao}</p>}
          <div className="flex flex-wrap gap-4 justify-center">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                 className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-lg transition shadow-xl">
                💬 Falar no WhatsApp
              </a>
            )}
            {tel && (
              <a href={tel}
                 className="bg-white/15 hover:bg-white/25 text-white font-bold px-8 py-4 rounded-full text-lg transition border border-white/30">
                📞 {c.telefone}
              </a>
            )}
          </div>
          {c.endereco && (
            <p className="mt-8 text-white/50 text-sm">📍 {c.endereco}</p>
          )}
        </div>
      </section>

      {/* Serviços */}
      {c.servicos && c.servicos.length > 0 && (
        <section id="servicos" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Nossos Serviços</h2>
            <p className="text-gray-500 text-center mb-12">Tudo que oferecemos para você</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.servicos.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white text-xl font-bold"
                       style={{ backgroundColor: cor1 }}>
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.nome}</h3>
                  {s.descricao && <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.descricao}</p>}
                  {s.preco && (
                    <span className="text-lg font-bold" style={{ color: cor1 }}>{s.preco}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contato */}
      <section id="contato" className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Fale Conosco</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                 className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition group text-center">
                <span className="text-4xl">💬</span>
                <span className="font-semibold text-gray-900">WhatsApp</span>
                <span className="text-sm text-gray-500">{c.whatsapp}</span>
              </a>
            )}
            {tel && (
              <a href={tel}
                 className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition text-center">
                <span className="text-4xl">📞</span>
                <span className="font-semibold text-gray-900">Telefone</span>
                <span className="text-sm text-gray-500">{c.telefone}</span>
              </a>
            )}
            {c.endereco && (
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 text-center">
                <span className="text-4xl">📍</span>
                <span className="font-semibold text-gray-900">Endereço</span>
                <span className="text-sm text-gray-500">{c.endereco}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-10 text-center" style={{ backgroundColor: cor1 }}>
        <p className="text-xl font-bold mb-1">{c.nome_negocio}</p>
        {c.slogan && <p className="text-white/60 text-sm mb-1">{c.slogan}</p>}
        {c.instagram && <p className="text-white/50 text-sm">{c.instagram}</p>}
        <p className="text-white/30 text-xs mt-6">Site criado com ExpoSite</p>
      </footer>
    </div>
  )
}
