'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { removerToken } from '@/lib/auth'

export default function Perfil() {
  const router = useRouter()
  const [form, setForm] = useState({
    senha_atual:          '',
    nova_senha:           '',
    nova_senha_confirmation: '',
  })
  const [erro, setErro]       = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  function atualizar(campo: string, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (form.nova_senha !== form.nova_senha_confirmation) {
      setErro('A nova senha e a confirmação não coincidem.')
      return
    }

    setCarregando(true)
    try {
      const res = await api.put<{ mensagem: string }>('/api/painel/perfil/senha', form)
      setSucesso(res.mensagem)
      setTimeout(() => {
        removerToken()
        router.replace('/login')
      }, 2000)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Perfil</h1>
      <p className="text-slate-500 mb-8">Altere sua senha de acesso ao painel.</p>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha atual</label>
            <input
              type="password"
              required
              value={form.senha_atual}
              onChange={e => atualizar('senha_atual', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.nova_senha}
              onChange={e => atualizar('nova_senha', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              required
              value={form.nova_senha_confirmation}
              onChange={e => atualizar('nova_senha_confirmation', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              {sucesso} Redirecionando para o login...
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {carregando ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
