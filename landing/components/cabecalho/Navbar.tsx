'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#tipos-de-site', label: 'Tipos de site' },
  { href: '#planos', label: 'Planos' },
  { href: '#portfolio', label: 'Portfólio' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [aberto, setAberto] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-violet-600 tracking-tight">
          Expo<span className="text-slate-900">Site</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-violet-600 transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="/cadastro"
          className="hidden md:inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Criar meu site
        </a>

        <button className="md:hidden p-2 text-slate-600" onClick={() => setAberto(!aberto)} aria-label="Menu">
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {aberto && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setAberto(false)} className="text-sm text-slate-600 font-medium">
              {l.label}
            </a>
          ))}
          <a href="/cadastro" className="bg-violet-600 text-white text-sm font-semibold px-5 py-3 rounded-xl text-center">
            Criar meu site
          </a>
        </div>
      )}
    </header>
  )
}
