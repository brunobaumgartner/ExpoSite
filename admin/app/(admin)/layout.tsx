'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { estaAutenticado, removerToken } from '@/lib/auth'
import { api } from '@/lib/api'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clientes',  label: 'Clientes'  },
  { href: '/planos',    label: 'Planos'    },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [nome, setNome] = useState('')

  useEffect(() => {
    if (!estaAutenticado()) { router.replace('/login'); return }
    api.get<{ nome: string }>('/api/admin/auth/eu').then(d => setNome(d.nome)).catch(() => {
      removerToken(); router.replace('/login')
    })
  }, [router])

  function sair() {
    api.delete('/api/admin/auth/logout').catch(() => {})
    removerToken()
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-900 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-700">
          <span className="text-white font-bold">ExpoSite</span>
          <p className="text-slate-500 text-xs mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 py-3 border-t border-slate-700">
          {nome && <p className="text-slate-500 text-xs px-3 mb-2 truncate">{nome}</p>}
          <button onClick={sair}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
