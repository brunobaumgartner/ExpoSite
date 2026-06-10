import Link from 'next/link'

export default function PaginaConfirmado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">E-mail confirmado!</h1>
        <p className="text-slate-600 mb-6">
          Seu cadastro foi confirmado com sucesso. Em breve entraremos em contato
          pelo Telegram para ativar seu site.
        </p>
        <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-700 mb-6">
          Fique de olho no seu WhatsApp e Telegram — nosso assistente vai te chamar assim que seu acesso for liberado.
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
