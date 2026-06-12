import type { Metadata } from 'next'
import cfg from '../site.config.json'
import './globals.css'

const c = cfg as Record<string, unknown>

export const metadata: Metadata = {
  title: String(c.nome_negocio ?? 'Meu Negócio'),
  description: String(c.descricao ?? c.slogan ?? c.nome_negocio ?? ''),
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
