'use client'

import { useState } from 'react'

type Item = { nome: string; desc: string; preco: number; emoji: string; popular?: boolean }
type Categoria = { label: string; emoji: string; itens: Item[] }

const categorias: Categoria[] = [
  {
    label: 'Pizzas', emoji: '🍕',
    itens: [
      { nome: 'Margherita',         desc: 'Molho de tomate, mussarela de búfala, manjericão fresco',                preco: 52, emoji: '🍕', popular: true },
      { nome: 'Calabresa Artesanal', desc: 'Calabresa artesanal, cebola roxa, azeitona, mussarela',                preco: 49, emoji: '🍕' },
      { nome: 'Frango & Catupiry',   desc: 'Frango desfiado, catupiry cremoso, milho, tomate',                      preco: 55, emoji: '🍕', popular: true },
      { nome: 'Portuguesa',          desc: 'Presunto, ovo, azeitona, ervilha, cebola, mussarela',                   preco: 54, emoji: '🍕' },
      { nome: 'Quatro Queijos',      desc: 'Mussarela, prato, parmesão, catupiry, tomate cereja',                   preco: 58, emoji: '🍕' },
      { nome: 'Pepperoni',           desc: 'Pepperoni importado, mussarela, tomate, orégano',                       preco: 60, emoji: '🍕' },
    ],
  },
  {
    label: 'Massas', emoji: '🍝',
    itens: [
      { nome: 'Lasanha Bolonhesa',  desc: 'Carne moída temperada, molho bechamel, queijo gratinado',              preco: 45, emoji: '🍝', popular: true },
      { nome: 'Nhoque ao Sugo',     desc: 'Nhoque artesanal, molho de tomates frescos, manjericão',               preco: 38, emoji: '🍝' },
      { nome: 'Fettuccine Alfredo', desc: 'Fettuccine, creme de leite, parmesão, noz-moscada',                    preco: 42, emoji: '🍝' },
      { nome: 'Ravioli Ricota',     desc: 'Ravioli recheado, manteiga de sálvia, parmesão ralado',                preco: 48, emoji: '🍝' },
    ],
  },
  {
    label: 'Entradas', emoji: '🥗',
    itens: [
      { nome: 'Bruschetta',         desc: 'Pão ciabatta, tomate, alho, azeite, manjericão',                       preco: 22, emoji: '🥗' },
      { nome: 'Salada Caesar',      desc: 'Alface romana, croutons, parmesão, molho caesar',                     preco: 28, emoji: '🥗', popular: true },
      { nome: 'Carpaccio',          desc: 'Carne bovina fina, alcaparras, rúcula, parmesão, limão',               preco: 35, emoji: '🥗' },
    ],
  },
  {
    label: 'Bebidas', emoji: '🥤',
    itens: [
      { nome: 'Suco Natural 500ml', desc: 'Laranja, limão, maracujá, abacaxi com hortelã',                        preco: 14, emoji: '🍊' },
      { nome: 'Refrigerante Lata',  desc: 'Coca-Cola, Pepsi, Guaraná Antarctica, Fanta',                          preco: 8,  emoji: '🥤' },
      { nome: 'Água com Gás 500ml', desc: 'Água mineral gaseificada gelada',                                      preco: 6,  emoji: '💧' },
      { nome: 'Vinho da Casa',      desc: 'Tinto ou branco, taça 150ml',                                          preco: 18, emoji: '🍷' },
    ],
  },
  {
    label: 'Sobremesas', emoji: '🍰',
    itens: [
      { nome: 'Tiramisu',           desc: 'Biscoito champagne, mascarpone, café, cacau, receita italiana',        preco: 22, emoji: '🍰', popular: true },
      { nome: 'Panna Cotta',        desc: 'Creme italiano suave com calda de frutas vermelhas',                   preco: 18, emoji: '🍮' },
      { nome: 'Brownie',            desc: 'Brownie quente de chocolate, sorvete baunilha, calda',                 preco: 20, emoji: '🍫' },
    ],
  },
]

export default function TemplateCardapio() {
  const [abaAtiva, setAbaAtiva]     = useState(0)
  const [carrinho, setCarrinho]     = useState<Record<string, number>>({})
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0)
  const totalPreco = Object.entries(carrinho).reduce((acc, [nome, qty]) => {
    const item = categorias.flatMap(c => c.itens).find(i => i.nome === nome)
    return acc + (item?.preco ?? 0) * qty
  }, 0)

  function adicionar(nome: string) {
    setCarrinho(c => ({ ...c, [nome]: (c[nome] ?? 0) + 1 }))
  }
  function remover(nome: string) {
    setCarrinho(c => {
      const novo = { ...c }
      if ((novo[nome] ?? 0) <= 1) delete novo[nome]
      else novo[nome]--
      return novo
    })
  }

  const itensAtivos = categorias[abaAtiva].itens

  return (
    <div className="font-sans bg-white text-slate-900 min-h-screen">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-red-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black flex items-center gap-2">🍕 Pizzaria Bella</span>
          <div className="hidden md:flex gap-2 text-sm text-red-100">
            <span>⏱ Entrega 35–50 min</span>
            <span className="mx-2">·</span>
            <span>🛵 Grátis acima de R$ 50</span>
          </div>
          <button onClick={() => setCarrinhoAberto(true)}
            className="bg-white text-red-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
            🛒 {totalItens > 0 && <span className="bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItens}</span>}
            <span className="hidden sm:inline">Carrinho</span>
          </button>
        </div>
      </nav>

      {/* Banner hero */}
      <section className="pt-16 bg-gradient-to-br from-red-700 via-red-800 to-slate-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">As melhores pizzas da cidade</h1>
            <p className="text-red-200 text-lg">Ingredientes frescos · Forno a lenha · Massa artesanal</p>
            <div className="flex gap-4 mt-4 text-sm text-red-200">
              <span>⭐ 4.8 (1.234 avaliações)</span>
              <span>🕐 Aberto agora</span>
            </div>
          </div>
          <div className="text-8xl hidden md:block">🍕</div>
        </div>
      </section>

      {/* Categorias (sticky) */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {categorias.map((c, i) => (
              <button key={i} onClick={() => setAbaAtiva(i)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${abaAtiva === i ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Itens do cardápio */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {itensAtivos.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl p-4 flex gap-4 hover:border-red-200 transition-colors">
              <div className="bg-red-50 rounded-xl w-20 h-20 flex items-center justify-center text-4xl shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{item.nome}</p>
                  {item.popular && <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                </div>
                <p className="text-slate-400 text-sm mt-0.5 leading-snug line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-black text-red-700 text-lg">R$ {item.preco}</span>
                  {carrinho[item.nome] ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => remover(item.nome)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors">−</button>
                      <span className="font-bold w-5 text-center">{carrinho[item.nome]}</span>
                      <button onClick={() => adicionar(item.nome)} className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center transition-colors">+</button>
                    </div>
                  ) : (
                    <button onClick={() => adicionar(item.nome)} className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                      + Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrinho lateral */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCarrinhoAberto(false)} />
          <div className="bg-white w-full max-w-sm flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-black text-lg">🛒 Seu pedido</h3>
              <button onClick={() => setCarrinhoAberto(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {totalItens === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Seu carrinho está vazio 🍕</p>
              ) : (
                Object.entries(carrinho).map(([nome, qty]) => {
                  const item = categorias.flatMap(c => c.itens).find(i => i.nome === nome)!
                  return (
                    <div key={nome} className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{nome}</p>
                        <p className="text-red-600 font-bold text-sm">R$ {(item.preco * qty).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => remover(nome)} className="w-7 h-7 rounded-full bg-slate-100 font-bold text-sm flex items-center justify-center">−</button>
                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                        <button onClick={() => adicionar(nome)} className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">+</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {totalItens > 0 && (
              <div className="p-5 border-t border-slate-200">
                <div className="flex justify-between font-black text-lg mb-4">
                  <span>Total</span>
                  <span>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-base transition-colors">
                  Finalizar pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span className="font-black text-white text-base">🍕 Pizzaria Bella</span>
          <p>📍 Av. Brasil, 789 · (11) 3344-5566 · Ter–Dom 18h–23h</p>
          <p>Site criado com <span className="text-violet-400">ExpoSite</span></p>
        </div>
      </footer>
    </div>
  )
}
