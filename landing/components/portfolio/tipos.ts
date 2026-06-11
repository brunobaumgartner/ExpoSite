export type TipoSite = 'Landing Page' | 'Agendamento' | 'Cardápio' | 'E-commerce' | 'Institucional'

export type Exemplo = {
  tipo: TipoSite
  negocio: string
  emoji: string
  cor: string
  templateUrl: string
}

export const exemplos: Exemplo[] = [
  { tipo: 'Landing Page',  negocio: 'Academia FitLife',   emoji: '💪', cor: 'from-blue-500 to-blue-700',   templateUrl: '/templates/landing-page' },
  { tipo: 'Agendamento',   negocio: 'Barbearia do João',  emoji: '✂️', cor: 'from-slate-700 to-slate-900', templateUrl: '/templates/agendamento'  },
  { tipo: 'Cardápio',      negocio: 'Pizzaria Bella',     emoji: '🍕', cor: 'from-red-500 to-red-700',     templateUrl: '/templates/cardapio'     },
  { tipo: 'E-commerce',    negocio: 'Loja da Maria',      emoji: '👗', cor: 'from-pink-500 to-pink-700',   templateUrl: '/templates/ecommerce'    },
  { tipo: 'Institucional', negocio: 'Clínica Dr. Silva',  emoji: '🏥', cor: 'from-teal-500 to-teal-700',   templateUrl: '/templates/institucional'},
  { tipo: 'Landing Page',  negocio: 'Adv. Santos & Ass.', emoji: '⚖️', cor: 'from-amber-600 to-amber-800', templateUrl: '/templates/landing-page' },
]
