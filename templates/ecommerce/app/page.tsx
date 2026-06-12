import rawConfig from '../site.config.json'

type Produto = { nome: string; preco?: string; categoria?: string; em_estoque?: boolean }
type Config  = {
  nome_negocio: string; slogan?: string; telefone?: string
  whatsapp?: string; cor_primaria?: string; cor_secundaria?: string
  instagram?: string; produtos?: Produto[]
}

const c    = rawConfig as Config
const cor1  = c.cor_primaria  ?? '#ec4899'
const wa    = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : null
const comprar = (p: string) => wa ? `${wa}?text=${encodeURIComponent(`Olá! Tenho interesse em: ${p}`)}` : '#'

const categorias = c.produtos
  ? [...new Set(c.produtos.map(p => p.categoria ?? 'Outros'))]
  : []

export default function Page() {
  return (
    <div className="font-sans antialiased bg-gray-50">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black" style={{ color: cor1 }}>{c.nome_negocio}</span>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
               className="text-white text-sm font-bold px-4 py-2 rounded-full transition hover:opacity-90"
               style={{ backgroundColor: cor1 }}>
              💬 Comprar via WhatsApp
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-white py-16 text-center"
               style={{ background: `linear-gradient(135deg, ${cor1} 0%, ${c.cor_secundaria ?? cor1} 100%)` }}>
        <h1 className="text-4xl md:text-5xl font-black mb-2">{c.nome_negocio}</h1>
        {c.slogan && <p className="text-white/80 text-xl">{c.slogan}</p>}
        {c.instagram && <p className="text-white/50 text-sm mt-2">{c.instagram}</p>}
      </section>

      {/* Produtos */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {categorias.length > 0 ? (
          categorias.map(cat => {
            const prods = (c.produtos ?? []).filter(p => (p.categoria ?? 'Outros') === cat)
            return (
              <section key={cat} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: cor1 }} />
                  {cat}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prods.map((p, i) => (
                    <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!p.em_estoque ? 'opacity-50' : 'hover:shadow-md transition'}`}>
                      <div className="h-36 flex items-center justify-center text-5xl"
                           style={{ backgroundColor: `${cor1}15` }}>
                        🛍️
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900">{p.nome}</h3>
                        {!p.em_estoque && <p className="text-xs text-red-500 mt-1">Fora de estoque</p>}
                        <div className="flex items-center justify-between mt-3">
                          {p.preco && <span className="font-black text-xl" style={{ color: cor1 }}>{p.preco}</span>}
                          {p.em_estoque !== false && (
                            <a href={comprar(p.nome)} target="_blank" rel="noopener noreferrer"
                               className="text-white text-xs font-bold px-3 py-1.5 rounded-full transition hover:opacity-90"
                               style={{ backgroundColor: cor1 }}>
                              Comprar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <p className="text-center text-gray-400 py-20">Produtos em breve!</p>
        )}
      </main>

      {/* Footer */}
      <footer className="text-white py-8 text-center" style={{ backgroundColor: cor1 }}>
        <p className="font-bold text-lg">{c.nome_negocio}</p>
        {c.instagram && <p className="text-white/60 text-sm mt-1">{c.instagram}</p>}
        {c.telefone  && <p className="text-white/50 text-sm">📞 {c.telefone}</p>}
        <p className="text-white/30 text-xs mt-4">Site criado com ExpoSite</p>
      </footer>
    </div>
  )
}
