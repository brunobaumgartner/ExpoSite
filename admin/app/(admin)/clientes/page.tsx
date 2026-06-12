'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Cliente = {
  id: number; nome_empresa: string; slug: string; email: string
  status: string; tipo_site: string; plano: string | null
  mensagens_usadas_mes: number; tokens_usados_mes: number; created_at: string
}
type Pagina = { data: Cliente[]; current_page: number; last_page: number; total: number }

const STATUS_COR: Record<string, string> = {
  ativo:     'bg-green-100 text-green-700',
  suspenso:  'bg-red-100 text-red-700',
  cancelado: 'bg-slate-100 text-slate-500',
}

const PAINEL_URL = process.env.NEXT_PUBLIC_PAINEL_URL || 'https://app.exposite.com.br'

export default function Clientes() {
  const router  = useRouter()
  const [pagina, setPagina]   = useState<Pagina | null>(null)
  const [busca, setBusca]     = useState('')
  const [status, setStatus]   = useState('')
  const [pag, setPag]         = useState(1)
  const [erro, setErro]       = useState('')
  const [acaoId, setAcaoId]   = useState<number | null>(null)

  const carregar = useCallback(() => {
    const params = new URLSearchParams()
    if (busca)  params.set('busca', busca)
    if (status) params.set('status', status)
    params.set('page', String(pag))
    api.get<Pagina>(`/api/admin/clientes?${params}`).then(setPagina).catch(e => setErro(e.message))
  }, [busca, status, pag])

  useEffect(carregar, [carregar])

  async function acao(id: number, tipo: 'suspender' | 'reativar') {
    setAcaoId(id)
    try { await api.post(`/api/admin/clientes/${id}/${tipo}`); carregar() }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
    finally { setAcaoId(null) }
  }

  async function impersonar(id: number) {
    try {
      const d = await api.post<{ token: string }>(`/api/admin/clientes/${id}/impersonar`)
      window.open(`${PAINEL_URL}/login?token=${d.token}`, '_blank')
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Clientes</h1>

      <div className="flex gap-3 mb-4">
        <input value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} placeholder="Buscar por nome, e-mail ou slug..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPag(1) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
          <option value="">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="suspenso">Suspensos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {erro && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{erro}</div>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Plano</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Msgs</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Tokens</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagina?.data.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{c.nome_empresa}</p>
                  <p className="text-xs text-slate-400">{c.slug} · {c.tipo_site}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.plano ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COR[c.status] ?? ''}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{c.mensagens_usadas_mes}</td>
                <td className="px-4 py-3 text-right text-slate-500 text-xs">{c.tokens_usados_mes.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => router.push(`/clientes/${c.id}`)}
                      className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded">
                      Ver
                    </button>
                    <button onClick={() => impersonar(c.id)}
                      className="text-xs text-violet-600 hover:text-violet-800 border border-violet-200 px-2 py-1 rounded">
                      Entrar
                    </button>
                    {c.status === 'ativo' ? (
                      <button onClick={() => acao(c.id, 'suspender')} disabled={acaoId === c.id}
                        className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded disabled:opacity-50">
                        Suspender
                      </button>
                    ) : c.status === 'suspenso' ? (
                      <button onClick={() => acao(c.id, 'reativar')} disabled={acaoId === c.id}
                        className="text-xs text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded disabled:opacity-50">
                        Reativar
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagina && pagina.last_page > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>{pagina.total} clientes</span>
            <div className="flex gap-2">
              <button onClick={() => setPag(p => p - 1)} disabled={pag === 1}
                className="px-3 py-1 border border-slate-200 rounded disabled:opacity-40">← Anterior</button>
              <button onClick={() => setPag(p => p + 1)} disabled={pag === pagina.last_page}
                className="px-3 py-1 border border-slate-200 rounded disabled:opacity-40">Próxima →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
