'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type DashData = {
  clientes: { total: number; ativos: number; suspensos: number }
  financeiro: { mrr: number; receita_mes: number }
  uso: { mensagens_mes: number; tokens_mes: number }
  pre_registros_7d: { dia: string; total: number }[]
  visualizacoes_7d:  { dia: string; total: number }[]
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function MiniBar({ dados, label }: { dados: { dia: string; total: number }[]; label: string }) {
  if (!dados.length) return null
  const max = Math.max(...dados.map(d => d.total), 1)
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-semibold text-slate-700 mb-4">{label} (7 dias)</p>
      <div className="flex items-end gap-1.5 h-20">
        {dados.map(d => (
          <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-violet-500 rounded-sm" style={{ height: `${Math.round((d.total / max) * 64)}px` }} />
            <span className="text-xs text-slate-400">{d.dia.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [dados, setDados] = useState<DashData | null>(null)
  const [erro, setErro]   = useState('')

  useEffect(() => {
    api.get<DashData>('/api/admin/dashboard').then(setDados).catch(e => setErro(e.message))
  }, [])

  if (erro) return <div className="p-8 text-red-500">{erro}</div>
  if (!dados) return <div className="p-8 text-slate-400">Carregando...</div>

  const { clientes, financeiro, uso } = dados

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card label="Clientes ativos"  value={clientes.ativos} sub={`${clientes.total} total`} />
        <Card label="MRR"              value={`R$ ${financeiro.mrr.toFixed(0)}`} sub="receita recorrente mensal" />
        <Card label="Mensagens/mês"    value={uso.mensagens_mes.toLocaleString()} />
        <Card label="Tokens/mês"       value={uso.tokens_mes.toLocaleString()} sub="OpenAI gpt-4o-mini" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniBar dados={dados.pre_registros_7d}  label="Novos pré-registros" />
        <MiniBar dados={dados.visualizacoes_7d}   label="Pageviews nos sites" />
      </div>
    </div>
  )
}
