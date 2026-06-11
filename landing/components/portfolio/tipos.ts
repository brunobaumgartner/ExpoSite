export type TipoSite = 'Landing Page' | 'Agendamento' | 'Cardápio' | 'E-commerce' | 'Institucional'

export type Exemplo = {
  tipo: TipoSite
  negocio: string
  emoji: string
  cor: string
  slug: string
  tema: { primaria: string; secundaria: string; texto: string }
}

export const exemplos: Exemplo[] = [
  { tipo: 'Landing Page',  negocio: 'Academia FitLife',    emoji: '💪', cor: 'from-blue-500 to-blue-700',   slug: 'fitlife',       tema: { primaria: '#2563eb', secundaria: '#1e40af', texto: '#eff6ff' } },
  { tipo: 'Agendamento',   negocio: 'Barbearia do João',   emoji: '✂️', cor: 'from-slate-700 to-slate-900', slug: 'barbearia-joao',tema: { primaria: '#1e293b', secundaria: '#0f172a', texto: '#f8fafc' } },
  { tipo: 'Cardápio',      negocio: 'Pizzaria Bella',      emoji: '🍕', cor: 'from-red-500 to-red-700',     slug: 'pizzaria-bella',tema: { primaria: '#dc2626', secundaria: '#991b1b', texto: '#fff1f2' } },
  { tipo: 'E-commerce',    negocio: 'Loja da Maria',       emoji: '👗', cor: 'from-pink-500 to-pink-700',   slug: 'loja-maria',    tema: { primaria: '#db2777', secundaria: '#9d174d', texto: '#fdf2f8' } },
  { tipo: 'Institucional', negocio: 'Clínica Dr. Silva',   emoji: '🏥', cor: 'from-teal-500 to-teal-700',   slug: 'clinica-silva', tema: { primaria: '#0d9488', secundaria: '#0f766e', texto: '#f0fdfa' } },
  { tipo: 'Landing Page',  negocio: 'Adv. Santos & Ass.',  emoji: '⚖️', cor: 'from-amber-600 to-amber-800', slug: 'adv-santos',    tema: { primaria: '#d97706', secundaria: '#92400e', texto: '#fffbeb' } },
]
