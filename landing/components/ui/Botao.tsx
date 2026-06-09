'use client'

import Link from 'next/link'

interface Props {
  href: string
  variante?: 'primario' | 'secundario' | 'fantasma'
  tamanho?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const estilos = {
  primario: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg',
  secundario: 'bg-white hover:bg-violet-50 text-violet-600 border border-violet-600',
  fantasma: 'bg-transparent hover:bg-white/10 text-white border border-white/40',
}

const tamanhos = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Botao({ href, variante = 'primario', tamanho = 'md', children, className = '' }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${estilos[variante]} ${tamanhos[tamanho]} ${className}`}
    >
      {children}
    </Link>
  )
}
