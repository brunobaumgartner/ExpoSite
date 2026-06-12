'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

type LogItem = { id: number; tipo: string; acao: string | null; descricao: string | null; tokens_usados: number; status: string; created_at: string }
type Detalhe = {
  cliente: { id: number; nome: string; nome_empresa: string; slug: string; email: string; status: string; tipo_site: string; subdominio: string; plano: string | null; mensagens_usadas_mes: number; tokens_usados_mes: number; created_at: string }
  banco_mb: number
  logs: LogItem[]
  analytics: { visualizacoes_mes: number; por_dia: { dia: string; total: number }[]; top_paginas: { caminho: string; total: number }[] }
}

const TIPO_COR: Record<string, string> = {
  mensagem: 'bg-blue-100 text-blue-700',
  atualizacao_site: 'bg-green-100 text-green-700',
  rollback: 'bg-yellow-100 text-yellow-700',
  sistema: 'bg-slate-100 text-slate-500',
}

const PAINEL_URL = process.env.NEXT_PUBLIC_PAINEL_URL || 'https://app.exposite.com.br'

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [dados, setDados]     = useState<Detalhe | null>(null)
  const [erro, setErro]       = useState('')
  const [impToken, setImpToken] = useState<string | null>(null)

  useEffect(() => {
    api.get<Detalhe>(`/api/admin/clientes/${id}`).then(setDados).catch(e => setErro(e.message))
  }, [id])

  async function entrar() {
    try {
      const d = await api.post<{ token: string }>(`/api/admin/clientes/${id}/impersonar`)
      window.open(`${PAINEL_URL}/login?token=${d.token}`, '_blank')
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro') }
  }

  if (erro) return <div className="p-8 text-red-500">{erro}</div>
  if (!dados) return <div className="p-8 text-slate-400">Carregando...</div>

  const { cliente, banco_mb, logs, analytics } = dados
  const maxBar = Math.max(...analytics.por_dia.map(d => d.total), 1)

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{cliente.nome_empresa}</h1>
          <p className="text-slate-500 text-sm mt-1">{cliente.slug} · {cliente.tipo_site} · {cliente.plano}</p>
        </div>
        <button onClick={entrar}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          Entrar como cliente
        </button>
      </div>

      {/* Recursos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Banco de dados</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{banco_mb} MB</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Mensagens/mês</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{cliente.mensagens_usadas_mes}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Tokens OpenAI/mês</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{cliente.tokens_usados_mes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Pageviews/mês</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{analytics.visualizacoes_mes}</p>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Pageviews (7 dias)</p>
          <div className="flex items-end gap-1.5 h-20">
            {analytics.por_dia.map(d => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-violet-500 rounded-sm" style={{ height: `${Math.round((d.total / maxBar) * 64)}px` }} />
                <span className="text-xs text-slate-400">{d.dia.slice(5)}</span>
              </div>
            ))}
            {!analytics.por_dia.length && <p className="text-slate-400 text-sm">Sem dados</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Top páginas</p>
          <div className="space-y-2">
            {analytics.top_paginas.map(p => (
              <div key={p.caminho} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate">{p.caminho || '/'}</span>
                <span className="text-slate-400 shrink-0 ml-4">{p.total}</span>
              </div>
            ))}
            {!analytics.top_paginas.length && <p className="text-slate-400 text-sm">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Log de atividade */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Log de atividade</h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-auto">
          {logs.length === 0 && <p className="px-6 py-4 text-slate-400 text-sm">Nenhuma atividade ainda.</p>}
          {logs.map(log => {
            const cor = TIPO_COR[log.tipo] ?? 'bg-slate-100 text-slate-500'
            return (
              <div key={log.id} className="px-6 py-3 flex gap-3 items-start">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cor}`}>{log.tipo}</span>
                <div className="flex-1 min-w-0">
                  {log.acao && <p className="text-xs font-medium text-slate-600">{log.acao}</p>}
                  {log.descricao && <p className="text-sm text-slate-700 mt-0.5 line-clamp-2">{log.descricao}</p>}
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                    {log.tokens_usados > 0 && <span className="text-xs text-slate-400">{log.tokens_usados} tokens</span>}
                  </div>
                </div>
                <span className={`text-xs shrink-0 ${log.status === 'erro' ? 'text-red-500' : 'text-green-500'}`}>
                  {log.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
