'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type DashboardData = {
  cliente: {
    nome: string
    nome_empresa: string
    slug: string
    subdominio: string
    tipo_site: string
    mensagens_usadas_mes: number
  }
  plano: {
    nome: string
    limite_mensagens: number
  } | null
  site: {
    status: string
    publicado_em: string | null
    url: string
  }
}

const STATUS_LABEL: Record<string, { texto: string; cor: string }> = {
  publicado:  { texto: 'Publicado',   cor: 'bg-green-100 text-green-700' },
  construindo:{ texto: 'Construindo', cor: 'bg-yellow-100 text-yellow-700' },
  pendente:   { texto: 'Pendente',    cor: 'bg-blue-100 text-blue-700' },
  falhou:     { texto: 'Falhou',      cor: 'bg-red-100 text-red-700' },
  sem_versao: { texto: 'Sem versão',  cor: 'bg-slate-100 text-slate-500' },
}

export default function Dashboard() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [erro, setErro]   = useState('')

  useEffect(() => {
    api.get<DashboardData>('/api/painel/dashboard')
      .then(setDados)
      .catch(e => setErro(e.message))
  }, [])

  if (erro) return <div className="p-8 text-red-500">{erro}</div>
  if (!dados) return <div className="p-8 text-slate-400">Carregando...</div>

  const { cliente, plano, site } = dados
  const status = STATUS_LABEL[site.status] ?? STATUS_LABEL.sem_versao
  const usoPercent = plano?.limite_mensagens
    ? Math.min(100, Math.round((cliente.mensagens_usadas_mes / plano.limite_mensagens) * 100))
    : 0

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {cliente.nome.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-1">{cliente.nome_empresa}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status do site</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cor}`}>
              {status.texto}
            </span>
          </div>
          {site.publicado_em && (
            <p className="text-xs text-slate-400 mt-2">
              Publicado em {new Date(site.publicado_em).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mensagens este mês</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{cliente.mensagens_usadas_mes}</p>
          {plano?.limite_mensagens ? (
            <>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${usoPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">de {plano.limite_mensagens} no plano {plano.nome}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Plano {plano?.nome ?? '—'}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Seu site</p>
          <p className="text-sm font-semibold text-slate-700 mt-3 truncate">{cliente.subdominio}</p>
          <a
            href={`https://${cliente.subdominio}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs text-violet-600 hover:underline"
          >
            Abrir site →
          </a>
        </div>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-violet-800">Dica</p>
        <p className="text-sm text-violet-700 mt-1">
          Você pode atualizar seu site a qualquer momento pelo Telegram. Basta enviar uma mensagem de voz ou texto descrevendo o que quer mudar.
        </p>
      </div>
    </div>
  )
}
