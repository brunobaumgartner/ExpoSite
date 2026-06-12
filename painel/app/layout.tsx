import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ExpoSite — Painel',
  description: 'Gerencie seu site ExpoSite',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  )
}
