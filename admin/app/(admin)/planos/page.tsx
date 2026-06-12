'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Plano = {
  id: number; nome: string; slug: string; foco: string; modulos: string[]
  limite_tarefas: number; limite_produtos: number | null; limite_agendamentos: number | null
  preco_mensal: string; ativo: boolean; clientes_count: number
}

export default function Planos() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [erro, setErro]     = useState('')

  useEffect(() => {
    api.get<Plano[]>('/api/admin/planos').then(setPlanos).catch(e => setErro(e.message))
  }, [])

  if (erro) return <div className="p-8 text-red-500">{erro}</div>
  if (!planos.length) return <div className="p-8 text-slate-400">Carregando...</div>

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Planos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planos.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border p-5 ${p.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-slate-800">{p.nome}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{p.foco}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-800">R$ {parseFloat(p.preco_mensal).toFixed(0)}<span className="text-sm font-normal text-slate-400">/mês</span></p>
                <p className="text-xs text-slate-500 mt-0.5">{p.clientes_count} cliente{p.clientes_count !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.modulos.map(m => (
                <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m}</span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
              <span>📨 {p.limite_tarefas} tarefas</span>
              {p.limite_produtos != null && <span>📦 {p.limite_produtos} produtos</span>}
              {p.limite_agendamentos != null && <span>📅 {p.limite_agendamentos} agend.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
