'use client'

import { useState } from 'react'

const perguntas = [
  {
    q: 'Preciso saber programar ou mexer em computador?',
    r: 'Não. Se você consegue mandar mensagem no WhatsApp, consegue usar o ExpoSite. Basta conversar com o agente no Telegram.',
  },
  {
    q: 'Como eu gerencio meu site depois de criado?',
    r: 'Pelo mesmo Telegram. Mande mensagem ou áudio: "Muda o preço do corte para R$45", "Adiciona esse produto novo" — o agente entende e atualiza na hora.',
  },
  {
    q: 'E se eu quiser cancelar?',
    r: 'Você pode cancelar a qualquer hora pelo painel ou pelo Telegram. Seus dados ficam disponíveis por 30 dias após o cancelamento para download.',
  },
  {
    q: 'Meus dados e dos meus clientes ficam seguros?',
    r: 'Sim. Cada cliente tem um banco de dados completamente isolado. Nenhum dado é compartilhado entre empresas. O áudio processado pelo Whisper é descartado imediatamente.',
  },
  {
    q: 'Posso usar meu próprio domínio?',
    r: 'Sim, nos planos Pro e Business. No plano Básico você recebe um subdomínio grátis (seusite.exposite.com.br).',
  },
  {
    q: 'Quanto tempo para o site ficar no ar?',
    r: 'Minutos. Após o pagamento, o agente entra em contato e em menos de 10 minutos seu site está publicado.',
  },
  {
    q: 'E se o Telegram ficar fora do ar?',
    r: 'Seu site continua no ar normalmente. O Telegram é usado apenas para gerenciamento. Para mudanças urgentes, você também pode usar o painel web.',
  },
]

function Item({ q, r }: { q: string; r: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setAberto(!aberto)}
      >
        <span className="font-semibold text-slate-900 text-sm md:text-base">{q}</span>
        <span className={`text-violet-600 text-xl transition-transform flex-shrink-0 ${aberto ? 'rotate-45' : ''}`}>+</span>
      </button>
      {aberto && (
        <p className="pb-5 text-slate-500 text-sm leading-relaxed">{r}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">Dúvidas frequentes</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">FAQ</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8">
          {perguntas.map((p, i) => (
            <Item key={i} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
