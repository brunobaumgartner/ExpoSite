'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Versao = {
  id: number
  mensagem: string
  status: 'pendente' | 'construindo' | 'publicado' | 'falhou'
  publicado_em: string | null
  created_at: string
}

type SiteData = {
  configs: Record<string, string>
  versoes: Versao[]
  url: string
}

const STATUS: Record<string, { texto: string; cor: string }> = {
  publicado:  { texto: 'Publicado',   cor: 'bg-green-100 text-green-700' },
  construindo:{ texto: 'Construindo', cor: 'bg-yellow-100 text-yellow-700' },
  pendente:   { texto: 'Pendente',    cor: 'bg-blue-100 text-blue-700' },
  falhou:     { texto: 'Falhou',      cor: 'bg-red-100 text-red-700' },
}

export default function Site() {
  const [dados, setDados]         = useState<SiteData | null>(null)
  const [erro, setErro]           = useState('')
  const [rollbackId, setRollbackId] = useState<number | null>(null)
  const [mensagem, setMensagem]   = useState('')

  function carregar() {
    api.get<SiteData>('/api/painel/site')
      .then(setDados)
      .catch(e => setErro(e.message))
  }

  useEffect(carregar, [])

  async function fazerRollback(versaoId: number) {
    setRollbackId(versaoId)
    setMensagem('')
    try {
      const res = await api.post<{ mensagem: string }>(`/api/painel/site/rollback/${versaoId}`)
      setMensagem(res.mensagem)
      setTimeout(carregar, 1500)
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Erro ao reverter')
    } finally {
      setRollbackId(null)
    }
  }

  if (erro) return <div className="p-8 text-red-500">{erro}</div>
  if (!dados) return <div className="p-8 text-slate-400">Carregando...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meu Site</h1>
          <a
            href={dados.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:underline mt-1 inline-block"
          >
            {dados.url} →
          </a>
        </div>
      </div>

      {mensagem && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {mensagem}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Configurações atuais</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(dados.configs).length === 0 ? (
            <p className="px-6 py-4 text-slate-400 text-sm">Nenhuma configuração ainda. Configure pelo Telegram.</p>
          ) : (
            Object.entries(dados.configs).map(([chave, valor]) => (
              <div key={chave} className="px-6 py-3 flex gap-4">
                <span className="text-xs font-medium text-slate-500 w-40 shrink-0 pt-0.5">{chave}</span>
                <span className="text-sm text-slate-700 break-all">{valor}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Histórico de versões</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {dados.versoes.length === 0 ? (
            <p className="px-6 py-4 text-slate-400 text-sm">Nenhuma versão ainda.</p>
          ) : (
            dados.versoes.map((v, i) => {
              const s = STATUS[v.status] ?? { texto: v.status, cor: 'bg-slate-100 text-slate-500' }
              return (
                <div key={v.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">#{dados.versoes.length - i}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.cor}`}>
                        {s.texto}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 truncate">{v.mensagem || 'Sem descrição'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(v.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {v.status === 'publicado' && i !== 0 && (
                    <button
                      onClick={() => fazerRollback(v.id)}
                      disabled={rollbackId === v.id}
                      className="shrink-0 text-xs text-violet-600 hover:text-violet-800 font-medium disabled:opacity-50"
                    >
                      {rollbackId === v.id ? 'Revertendo...' : 'Usar esta versão'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
