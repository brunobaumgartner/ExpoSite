'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { estaAutenticado, removerToken } from '@/lib/auth'
import { api } from '@/lib/api'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icone: '◼' },
  { href: '/site',      label: 'Meu Site',   icone: '◻' },
  { href: '/perfil',    label: 'Perfil',     icone: '○' },
]

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [nomeEmpresa, setNomeEmpresa] = useState('')

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/login')
      return
    }
    api.get<{ nome_empresa: string }>('/api/painel/auth/eu')
      .then(d => setNomeEmpresa(d.nome_empresa))
      .catch(() => {
        removerToken()
        router.replace('/login')
      })
  }, [router])

  function sair() {
    api.delete('/api/painel/auth/logout').catch(() => {})
    removerToken()
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-900 flex flex-col">
        <div className="px-6 py-6 border-b border-slate-700">
          <span className="text-white font-bold text-lg">ExpoSite</span>
          {nomeEmpresa && (
            <p className="text-slate-400 text-xs mt-1 truncate">{nomeEmpresa}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const ativo = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs">{item.icone}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs">×</span>
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
