import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ExpoSite — Crie seu site falando com o Telegram',
  description:
    'Crie e gerencie seu site por voz ou texto via Telegram. Sem conhecimento técnico, sem agência, no ar em minutos.',
  keywords: 'criação de site, site pelo telegram, site para pequenos negócios, site barato',
  openGraph: {
    title: 'ExpoSite — Crie seu site falando com o Telegram',
    description: 'Crie e gerencie seu site por voz ou texto via Telegram. No ar em minutos.',
    url: 'https://exposite.com.br',
    siteName: 'ExpoSite',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
