'use client'

import { useState } from 'react'

type Produto = { nome: string; preco: number; de?: number; emoji: string; categoria: string; destaque?: boolean; novo?: boolean }

const produtos: Produto[] = [
  { nome: 'Blusa Floral Verão',    preco: 89,  de: 120, emoji: '👚', categoria: 'Blusas',    destaque: true },
  { nome: 'Saia Midi Plissada',    preco: 129,          emoji: '👗', categoria: 'Saias',     novo: true },
  { nome: 'Vestido Linho Bege',    preco: 189, de: 240, emoji: '👘', categoria: 'Vestidos',  destaque: true },
  { nome: 'Calça Wide Leg',        preco: 149,          emoji: '👖', categoria: 'Calças' },
  { nome: 'Cardigan Tricô',        preco: 99,  de: 130, emoji: '🧶', categoria: 'Blusas' },
  { nome: 'Bolsa Tote Canvas',     preco: 79,           emoji: '👜', categoria: 'Acessórios', destaque: true },
  { nome: 'Vestido Floral Midi',   preco: 159, de: 200, emoji: '🌸', categoria: 'Vestidos',  novo: true },
  { nome: 'Tênis Flatform',        preco: 219,          emoji: '👟', categoria: 'Calçados' },
  { nome: 'Blazer Linho',          preco: 249, de: 320, emoji: '🧥', categoria: 'Blusas',    destaque: true },
  { nome: 'Shorts Jeans',          preco: 89,           emoji: '🩳', categoria: 'Calças',     novo: true },
  { nome: 'Sandália Couro',        preco: 179, de: 220, emoji: '👡', categoria: 'Calçados' },
  { nome: 'Colar Dourado',         preco: 49,           emoji: '📿', categoria: 'Acessórios' },
]

const categorias = ['Todos', 'Blusas', 'Saias', 'Vestidos', 'Calças', 'Calçados', 'Acessórios']

export default function TemplateEcommerce() {
  const [categoriaSel, setCategoriaSel] = useState('Todos')
  const [carrinho, setCarrinho]         = useState<Record<string, number>>({})
  const [busca, setBusca]               = useState('')
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [favoritos, setFavoritos]       = useState<Set<string>>(new Set())

  const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0)
  const totalPreco = Object.entries(carrinho).reduce((acc, [nome, qty]) => {
    return acc + (produtos.find(p => p.nome === nome)?.preco ?? 0) * qty
  }, 0)

  const filtrados = produtos.filter(p =>
    (categoriaSel === 'Todos' || p.categoria === categoriaSel) &&
    (!busca || p.nome.toLowerCase().includes(busca.toLowerCase()))
  )

  function toggleCarrinho(nome: string) {
    setCarrinho(c => c[nome] ? (() => { const n = { ...c }; delete n[nome]; return n })() : { ...c, [nome]: 1 })
  }

  function toggleFav(nome: string) {
    setFavoritos(f => { const n = new Set(f); n.has(nome) ? n.delete(nome) : n.add(nome); return n })
  }

  return (
    <div className="font-sans bg-white text-slate-900 min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <span className="text-xl font-black text-pink-600 shrink-0">👗 Loja da Maria</span>
          <div className="flex-1 hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 mx-4">
            <span className="text-slate-400">🔍</span>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="bg-transparent flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="hidden md:flex gap-6 text-sm text-slate-500 shrink-0">
            {['Novidades', 'Promoções', 'Marcas'].map(l => (
              <a key={l} href="#" className="hover:text-pink-600 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex gap-3 items-center ml-auto md:ml-0 shrink-0">
            <button className="text-slate-500 hover:text-pink-600 transition-colors text-lg">♡</button>
            <button onClick={() => setCarrinhoAberto(true)} className="relative text-slate-600 hover:text-pink-600 transition-colors text-xl">
              🛍️
              {totalItens > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-xs w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none w-5 h-5">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <section className="pt-16 bg-gradient-to-r from-pink-600 to-rose-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">✨ Nova coleção Verão 2025</span>
            <h1 className="text-4xl font-black mt-3 mb-2">Moda feminina com alma</h1>
            <p className="text-pink-100 text-lg">Peças exclusivas para todas as ocasiões</p>
            <div className="flex gap-3 mt-5">
              <button className="bg-white text-pink-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-pink-50 transition-colors">
                Ver coleção
              </button>
              <button className="border border-white/40 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:border-white transition-colors">
                Promoções
              </button>
            </div>
          </div>
          <div className="text-8xl hidden md:block">👗</div>
        </div>
      </section>

      {/* Filtros + Grid */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categorias.map(c => (
              <button key={c} onClick={() => setCategoriaSel(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${categoriaSel === c ? 'bg-pink-600 text-white border-pink-600' : 'border-slate-200 text-slate-600 hover:border-pink-400'}`}>
                {c}
              </button>
            ))}
          </div>
          <p className="text-slate-400 text-sm shrink-0">{filtrados.length} produtos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtrados.map((p, i) => (
            <div key={i} className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="bg-pink-50 h-40 flex items-center justify-center text-6xl relative">
                {p.emoji}
                {p.destaque && <span className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Destaque</span>}
                {p.novo && <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Novo</span>}
                <button onClick={() => toggleFav(p.nome)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-base shadow-sm hover:scale-110 transition-transform">
                  {favoritos.has(p.nome) ? '❤️' : '🤍'}
                </button>
              </div>
              <div className="p-3">
                <p className="font-semibold text-slate-900 text-sm leading-tight">{p.nome}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-black text-pink-600">R$ {p.preco}</span>
                  {p.de && <span className="text-slate-400 text-xs line-through">R$ {p.de}</span>}
                </div>
                {p.de && <p className="text-emerald-600 text-xs font-semibold">-{Math.round((1 - p.preco / p.de) * 100)}% OFF</p>}
                <p className="text-slate-400 text-xs mt-0.5">3x de R$ {(p.preco / 3).toFixed(2).replace('.', ',')} sem juros</p>
                <button onClick={() => toggleCarrinho(p.nome)}
                  className={`w-full mt-3 py-2 rounded-xl text-sm font-bold transition-colors ${carrinho[p.nome] ? 'bg-slate-900 text-white' : 'bg-pink-600 hover:bg-pink-500 text-white'}`}>
                  {carrinho[p.nome] ? '✓ Adicionado' : 'Adicionar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { emoji: '🚚', titulo: 'Frete grátis', desc: 'Compras acima de R$ 150' },
            { emoji: '↩️', titulo: 'Troca fácil', desc: 'Até 30 dias após a compra' },
            { emoji: '🔒', titulo: 'Pagamento seguro', desc: 'Pix, cartão, boleto' },
            { emoji: '💬', titulo: 'Atendimento', desc: 'WhatsApp das 9h às 18h' },
          ].map((b, i) => (
            <div key={i}>
              <span className="text-3xl">{b.emoji}</span>
              <p className="font-bold mt-2 text-sm">{b.titulo}</p>
              <p className="text-slate-500 text-xs mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carrinho lateral */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCarrinhoAberto(false)} />
          <div className="bg-white w-full max-w-sm flex flex-col shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-black text-lg">🛍️ Carrinho ({totalItens})</h3>
              <button onClick={() => setCarrinhoAberto(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {totalItens === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Seu carrinho está vazio 👗</p>
              ) : (
                Object.entries(carrinho).map(([nome]) => {
                  const p = produtos.find(x => x.nome === nome)!
                  return (
                    <div key={nome} className="flex gap-3 items-center">
                      <div className="bg-pink-50 rounded-xl w-12 h-12 flex items-center justify-center text-2xl shrink-0">{p.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{nome}</p>
                        <p className="text-pink-600 font-black text-sm">R$ {p.preco}</p>
                      </div>
                      <button onClick={() => toggleCarrinho(nome)} className="text-slate-300 hover:text-red-500 transition-colors text-sm">✕</button>
                    </div>
                  )
                })
              )}
            </div>
            {totalItens > 0 && (
              <div className="p-5 border-t">
                <div className="flex justify-between font-black text-lg mb-1">
                  <span>Total</span>
                  <span>R$ {totalPreco}</span>
                </div>
                <p className="text-slate-400 text-xs mb-4">Frete calculado no checkout</p>
                <button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-xl text-base transition-colors">
                  Finalizar compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-black text-white text-base">👗 Loja da Maria</span>
          <p>📍 Rua das Flores, 321 · (11) 99887-6655 · Seg–Sáb 10h–20h</p>
          <p>Site criado com <span className="text-violet-400">ExpoSite</span></p>
        </div>
      </footer>
    </div>
  )
}
