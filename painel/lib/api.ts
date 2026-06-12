import { getToken, removerToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = getToken()

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  })

  if (resposta.status === 401) {
    removerToken()
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  if (!resposta.ok) {
    const dados = await resposta.json().catch(() => ({}))
    throw new Error(dados.mensagem || `Erro ${resposta.status}`)
  }

  return resposta.json()
}

export const api = {
  get:    <T>(caminho: string)                   => requisitar<T>(caminho),
  post:   <T>(caminho: string, corpo?: unknown)  => requisitar<T>(caminho, { method: 'POST',   body: JSON.stringify(corpo) }),
  put:    <T>(caminho: string, corpo?: unknown)  => requisitar<T>(caminho, { method: 'PUT',    body: JSON.stringify(corpo) }),
  delete: <T>(caminho: string)                   => requisitar<T>(caminho, { method: 'DELETE' }),
}
