'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Etapa = 1 | 2 | 3

const tiposSite = [
  { valor: 'landing-page', label: '🎯 Landing Page' },
  { valor: 'institucional', label: '🏢 Institucional' },
  { valor: 'ecommerce', label: '🛒 E-commerce' },
  { valor: 'cardapio', label: '🍽️ Cardápio Digital' },
  { valor: 'agendamento', label: '📅 Agendamento' },
]

function formatarCPF(valor: string): string {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatarTelefone(valor: string): string {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function slugificar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export default function PaginaCadastro() {
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [slugStatus, setSlugStatus] = useState<'idle' | 'verificando' | 'disponivel' | 'indisponivel'>('idle')

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    nome_empresa: '',
    tipo_site: '',
    slug_desejado: '',
    senha: '',
    senha_confirmation: '',
  })

  const atualizar = (campo: string, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor }))
    setErros(e => ({ ...e, [campo]: '' }))
  }

  const verificarSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) { setSlugStatus('idle'); return }
    setSlugStatus('verificando')
    try {
      const res = await fetch(`/api/cadastro/verificar-slug/${slug}`)
      const dados = await res.json()
      setSlugStatus(dados.disponivel ? 'disponivel' : 'indisponivel')
    } catch {
      setSlugStatus('idle')
    }
  }, [])

  useEffect(() => {
    if (!form.slug_desejado) { setSlugStatus('idle'); return }
    const t = setTimeout(() => verificarSlug(form.slug_desejado), 500)
    return () => clearTimeout(t)
  }, [form.slug_desejado, verificarSlug])

  const validarEtapa1 = () => {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const validarEtapa2 = () => {
    const e: Record<string, string> = {}
    if (!form.nome_empresa.trim()) e.nome_empresa = 'Nome da empresa é obrigatório'
    if (!form.tipo_site) e.tipo_site = 'Selecione o tipo de site'
    if (!form.slug_desejado) e.slug_desejado = 'Endereço é obrigatório'
    if (slugStatus === 'indisponivel') e.slug_desejado = 'Este endereço já está em uso'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const validarEtapa3 = () => {
    const e: Record<string, string> = {}
    if (form.senha.length < 8) e.senha = 'Mínimo 8 caracteres'
    if (form.senha !== form.senha_confirmation) e.senha_confirmation = 'Senhas não coincidem'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const avancar = () => {
    if (etapa === 1 && validarEtapa1()) setEtapa(2)
    if (etapa === 2 && validarEtapa2()) setEtapa(3)
  }

  const enviar = async () => {
    if (!validarEtapa3()) return
    setCarregando(true)
    try {
      const res = await fetch('/api/cadastro/pre-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      })
      const dados = await res.json()
      if (!res.ok) {
        if (dados.errors) {
          const mapeados: Record<string, string> = {}
          Object.entries(dados.errors).forEach(([k, v]) => {
            mapeados[k] = Array.isArray(v) ? v[0] as string : v as string
          })
          setErros(mapeados)
          if (mapeados.nome || mapeados.cpf || mapeados.email || mapeados.telefone) setEtapa(1)
          else if (mapeados.nome_empresa || mapeados.tipo_site || mapeados.slug_desejado) setEtapa(2)
        }
        return
      }
      setEnviado(true)
    } catch {
      setErros({ geral: 'Erro ao enviar. Tente novamente.' })
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-6">📬</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Quase lá!</h1>
          <p className="text-slate-600 mb-6">
            Enviamos um e-mail de confirmação para <strong>{form.email}</strong>.
            Clique no link para ativar seu cadastro.
          </p>
          <p className="text-slate-400 text-sm">Não recebeu? Verifique a pasta de spam.</p>
          <Link href="/" className="mt-8 inline-block text-violet-600 hover:text-violet-700 font-medium text-sm">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
          <Link href="/" className="text-violet-200 hover:text-white text-sm mb-4 inline-block">← Voltar</Link>
          <h1 className="text-2xl font-extrabold">Criar minha conta</h1>
          <p className="text-violet-200 text-sm mt-1">Preencha seus dados para começar</p>

          {/* Progresso */}
          <div className="flex gap-2 mt-6">
            {([1, 2, 3] as Etapa[]).map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-all ${n <= etapa ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
          <p className="text-violet-200 text-xs mt-2">Etapa {etapa} de 3</p>
        </div>

        <div className="p-8">
          {erros.geral && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {erros.geral}
            </div>
          )}

          {/* Etapa 1 — Dados pessoais */}
          {etapa === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-900 text-lg mb-2">Seus dados</h2>

              <Campo label="Nome completo" erro={erros.nome}>
                <input
                  className={input(erros.nome)}
                  placeholder="João da Silva"
                  value={form.nome}
                  onChange={e => atualizar('nome', e.target.value)}
                />
              </Campo>

              <Campo label="CPF" erro={erros.cpf}>
                <input
                  className={input(erros.cpf)}
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={e => atualizar('cpf', formatarCPF(e.target.value))}
                />
              </Campo>

              <Campo label="E-mail" erro={erros.email}>
                <input
                  className={input(erros.email)}
                  type="email"
                  placeholder="joao@email.com"
                  value={form.email}
                  onChange={e => atualizar('email', e.target.value)}
                />
              </Campo>

              <Campo label="Telefone / WhatsApp" erro={erros.telefone}>
                <input
                  className={input(erros.telefone)}
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={e => atualizar('telefone', formatarTelefone(e.target.value))}
                />
              </Campo>
            </div>
          )}

          {/* Etapa 2 — Dados do negócio */}
          {etapa === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-900 text-lg mb-2">Seu negócio</h2>

              <Campo label="Nome da empresa / negócio" erro={erros.nome_empresa}>
                <input
                  className={input(erros.nome_empresa)}
                  placeholder="Barbearia do João"
                  value={form.nome_empresa}
                  onChange={e => {
                    atualizar('nome_empresa', e.target.value)
                    if (!form.slug_desejado) {
                      atualizar('slug_desejado', slugificar(e.target.value))
                    }
                  }}
                />
              </Campo>

              <Campo label="Tipo de site" erro={erros.tipo_site}>
                <select
                  className={input(erros.tipo_site)}
                  value={form.tipo_site}
                  onChange={e => atualizar('tipo_site', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tiposSite.map(t => (
                    <option key={t.valor} value={t.valor}>{t.label}</option>
                  ))}
                </select>
              </Campo>

              <Campo
                label="Endereço do seu site"
                erro={erros.slug_desejado}
                dica={
                  slugStatus === 'disponivel' ? '✅ Disponível!' :
                  slugStatus === 'indisponivel' ? '❌ Já está em uso' :
                  slugStatus === 'verificando' ? '⏳ Verificando...' : undefined
                }
                dicaCor={slugStatus === 'disponivel' ? 'text-green-600' : 'text-red-500'}
              >
                <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-violet-400">
                  <input
                    className="flex-1 px-4 py-3 outline-none text-slate-900 placeholder-slate-400"
                    placeholder="meu-negocio"
                    value={form.slug_desejado}
                    onChange={e => atualizar('slug_desejado', slugificar(e.target.value))}
                  />
                  <span className="bg-slate-50 px-3 flex items-center text-slate-400 text-sm border-l border-slate-200 whitespace-nowrap">
                    .exposite.com.br
                  </span>
                </div>
              </Campo>
            </div>
          )}

          {/* Etapa 3 — Senha */}
          {etapa === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-900 text-lg mb-2">Crie sua senha</h2>
              <p className="text-slate-500 text-sm">Você vai usar para acessar o painel de controle do seu site.</p>

              <Campo label="Senha" erro={erros.senha}>
                <input
                  className={input(erros.senha)}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.senha}
                  onChange={e => atualizar('senha', e.target.value)}
                />
              </Campo>

              <Campo label="Confirmar senha" erro={erros.senha_confirmation}>
                <input
                  className={input(erros.senha_confirmation)}
                  type="password"
                  placeholder="Repita a senha"
                  value={form.senha_confirmation}
                  onChange={e => atualizar('senha_confirmation', e.target.value)}
                />
              </Campo>

              <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-700 mt-4">
                <strong>Resumo do cadastro:</strong><br />
                {form.nome} · {form.email}<br />
                {form.nome_empresa} · {tiposSite.find(t => t.valor === form.tipo_site)?.label}<br />
                {form.slug_desejado}.exposite.com.br
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 mt-8">
            {etapa > 1 && (
              <button
                onClick={() => setEtapa(e => (e - 1) as Etapa)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>
            )}
            {etapa < 3 ? (
              <button
                onClick={avancar}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
              >
                Continuar →
              </button>
            ) : (
              <button
                onClick={enviar}
                disabled={carregando}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? 'Enviando...' : 'Criar minha conta'}
              </button>
            )}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            Ao cadastrar você concorda com nossos{' '}
            <a href="#" className="text-violet-500 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-violet-500 hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function input(erro?: string): string {
  return `w-full px-4 py-3 rounded-xl border outline-none transition-all text-slate-900 placeholder-slate-400 bg-white ${
    erro ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-slate-200 focus:ring-2 focus:ring-violet-400'
  }`
}

function Campo({
  label, erro, dica, dicaCor = 'text-slate-400', children
}: {
  label: string
  erro?: string
  dica?: string
  dicaCor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {erro && <p className="text-red-500 text-xs mt-1">{erro}</p>}
      {!erro && dica && <p className={`text-xs mt-1 ${dicaCor}`}>{dica}</p>}
    </div>
  )
}
