'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setToken, estaAutenticado } from '@/lib/auth'

export default function Login() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [erro, setErro]           = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (estaAutenticado()) router.replace('/dashboard')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const d = await api.post<{ token: string }>('/api/admin/auth/login', { email, senha })
      setToken(d.token)
      router.replace('/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ExpoSite</h1>
          <p className="text-slate-400 mt-1 text-sm">Painel Administrativo</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>
            {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>}
            <button type="submit" disabled={carregando}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
