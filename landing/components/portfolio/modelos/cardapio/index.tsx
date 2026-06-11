'use client'

import { useState } from 'react'
import type { Exemplo } from '../../tipos'

const categorias = ['Pizzas', 'Massas', 'Bebidas', 'Sobremesas']

const itens = [
  [
    { nome: 'Margherita',          desc: 'Molho, mussarela, manjericão',       preco: 'R$ 42' },
    { nome: 'Calabresa',           desc: 'Calabresa, cebola, azeitona',         preco: 'R$ 39' },
    { nome: 'Frango c/ Catupiry',  desc: 'Frango desfiado, catupiry',           preco: 'R$ 46' },
    { nome: 'Portuguesa',          desc: 'Presunto, ovo, azeitona, ervilha',    preco: 'R$ 44' },
  ],
  [
    { nome: 'Lasanha Bolonhesa',   desc: 'Carne moída, molho bechamel',         preco: 'R$ 38' },
    { nome: 'Nhoque ao Sugo',      desc: 'Molho de tomate fresco',              preco: 'R$ 29' },
  ],
  [
    { nome: 'Refrigerante Lata',   desc: 'Coca, Guaraná, Fanta',                preco: 'R$ 7'  },
    { nome: 'Suco Natural',        desc: 'Laranja, limão, abacaxi',             preco: 'R$ 12' },
    { nome: 'Água',                desc: 'Com ou sem gás 500ml',                preco: 'R$ 5'  },
  ],
  [
    { nome: 'Tiramisu',            desc: 'Receita italiana original',           preco: 'R$ 18' },
    { nome: 'Pudim',               desc: 'Caseiro com calda de caramelo',       preco: 'R$ 12' },
  ],
]

export default function TemplateCardapio({ ex }: { ex: Exemplo }) {
  const [aba, setAba] = useState(0)

  return (
    <div className="font-sans">
      <div style={{ background: ex.tema.primaria }} className="px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{ex.emoji}</span>
          <div>
            <h1 className="font-black text-lg">{ex.negocio}</h1>
            <p className="text-white/70 text-xs">Aberto agora · Entrega 40 min</p>
          </div>
        </div>
      </div>

      <div style={{ background: ex.tema.secundaria }} className="px-6">
        <div className="flex gap-0">
          {categorias.map((c, i) => (
            <button key={i} onClick={() => setAba(i)}
              className="px-4 py-3 text-xs font-semibold border-b-2 transition-colors"
              style={aba === i ? { borderColor: '#fff', color: '#fff' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.5)' }}>
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
              <button className="w-7 h-7 rounded-full text-white text-lg leading-none flex items-center justify-center"
                style={{ background: ex.tema.primaria }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
