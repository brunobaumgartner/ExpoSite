import rawConfig from '../site.config.json'

type Item      = { nome: string; descricao?: string; preco?: string }
type Categoria = { nome: string; itens: Item[] }
type Config    = {
  nome_negocio: string; slogan?: string; telefone?: string
  whatsapp?: string; endereco?: string; horario?: string
  cor_primaria?: string; cor_secundaria?: string
  instagram?: string; categorias?: Categoria[]
}

const c   = rawConfig as Config
const cor1 = c.cor_primaria  ?? '#dc2626'
const wa   = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : null
const pedido = (item: string) => wa ? `${wa}?text=${encodeURIComponent(`Olá! Quero pedir: ${item}`)}` : '#'

export default function Page() {
  return (
    <div className="font-sans antialiased bg-gray-50 min-h-screen">

      {/* Header */}
      <header className="text-white py-10 text-center shadow-lg" style={{ backgroundColor: cor1 }}>
        <h1 className="text-4xl md:text-5xl font-black mb-1">{c.nome_negocio}</h1>
        {c.slogan && <p className="text-white/70 text-lg">{c.slogan}</p>}
        <div className="flex flex-wrap gap-3 justify-center mt-4 text-sm">
          {c.horario  && <span className="bg-white/15 px-3 py-1 rounded-full">⏰ {c.horario}</span>}
          {c.telefone && <span className="bg-white/15 px-3 py-1 rounded-full">📞 {c.telefone}</span>}
          {c.endereco && <span className="bg-white/15 px-3 py-1 rounded-full">📍 {c.endereco}</span>}
        </div>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer"
             className="inline-block mt-4 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-full transition">
            💬 Fazer pedido
          </a>
        )}
      </header>

      {/* Cardápio */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        {c.categorias && c.categorias.length > 0 ? (
          c.categorias.map((cat, ci) => (
            <section key={ci} className="mb-10">
              <h2 className="text-2xl font-black text-gray-900 mb-4 pb-2 border-b-2"
                  style={{ borderColor: cor1, color: cor1 }}>
                {cat.nome}
              </h2>
              <div className="flex flex-col gap-3">
                {cat.itens.map((item, ii) => (
                  <a key={ii} href={pedido(item.nome)} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition group">
                    <div>
                      <p className="font-bold text-gray-900">{item.nome}</p>
                      {item.descricao && <p className="text-gray-500 text-sm mt-0.5">{item.descricao}</p>}
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      {item.preco && (
                        <p className="text-lg font-black" style={{ color: cor1 }}>{item.preco}</p>
                      )}
                      <span className="text-xs text-green-600">Pedir →</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-center text-gray-400 py-20">Cardápio em breve!</p>
        )}
      </main>

      {/* Footer */}
      <footer className="text-white py-8 text-center" style={{ backgroundColor: cor1 }}>
        <p className="font-bold text-lg">{c.nome_negocio}</p>
        {c.instagram && <p className="text-white/60 text-sm mt-1">{c.instagram}</p>}
        <p className="text-white/30 text-xs mt-4">Site criado com ExpoSite</p>
      </footer>
    </div>
  )
}
