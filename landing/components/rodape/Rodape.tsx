import Link from 'next/link'

const colunas = [
  {
    titulo: 'Produto',
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#tipos-de-site', label: 'Tipos de site' },
      { href: '#planos', label: 'Planos' },
      { href: '#portfolio', label: 'Portfólio' },
    ],
  },
  {
    titulo: 'Ajuda',
    links: [
      { href: '#faq', label: 'FAQ' },
      { href: '/contato', label: 'Contato' },
      { href: '/status', label: 'Status do serviço' },
    ],
  },
  {
    titulo: 'Legal',
    links: [
      { href: '/privacidade', label: 'Política de Privacidade' },
      { href: '/termos', label: 'Termos de Uso' },
      { href: '/lgpd', label: 'LGPD' },
      { href: '/cookies', label: 'Política de Cookies' },
    ],
  },
]

export default function Rodape() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link href="/" className="text-xl font-extrabold text-white mb-3 block">
              Expo<span className="text-violet-400">Site</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Criação e gestão de sites por voz e texto via Telegram.
            </p>
            <p className="text-sm mt-4">
              contato@exposite.com.br
            </p>
          </div>

          {colunas.map((col) => (
            <div key={col.titulo}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.titulo}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} ExpoSite. Todos os direitos reservados.</p>
          <p>Feito com 💜 para pequenos negócios brasileiros</p>
        </div>
      </div>
    </footer>
  )
}
