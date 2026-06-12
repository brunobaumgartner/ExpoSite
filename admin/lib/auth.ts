const TOKEN_KEY = 'exposite_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removerToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function estaAutenticado(): boolean {
  return !!getToken()
}
