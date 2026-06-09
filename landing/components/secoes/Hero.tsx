import Botao from '@/components/ui/Botao'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-400/20 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <span className="inline-block bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🚀 Site no ar em minutos
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Crie seu site<br />
            <span className="text-amber-400">falando com o</span><br />
            Telegram
          </h1>

          <p className="text-violet-100 text-lg md:text-xl mb-8 max-w-lg">
            Sem conhecimento técnico. Sem agência. Sem mensalidade cara.
            Você conversa, o agente cria e publica seu site automaticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Botao href="/cadastro" variante="fantasma" tamanho="lg">
              Criar meu site grátis por 7 dias
            </Botao>
            <a href="#como-funciona" className="inline-flex items-center justify-center gap-2 text-violet-200 hover:text-white font-medium transition-colors">
              Ver como funciona ↓
            </a>
          </div>

          <p className="mt-6 text-violet-300 text-sm">
            Sem cartão de crédito nos 7 dias de teste · Cancele quando quiser
          </p>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="bg-white/10 backdrop-blur rounded-3xl p-6 w-full max-w-sm border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
              <div className="w-10 h-10 rounded-full bg-violet-400 flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-semibold text-sm">Agente ExpoSite</p>
                <p className="text-xs text-violet-300">Online agora</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-end">
                <div className="bg-white/20 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  Quero um site de barbearia 💈
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-slate-800">
                  Perfeito! Qual o nome da barbearia?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-white/20 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  Barbearia do João
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-slate-800">
                  ✅ Site criado! Acesse:<br />
                  <span className="text-violet-600 font-medium">joao.exposite.com.br</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
