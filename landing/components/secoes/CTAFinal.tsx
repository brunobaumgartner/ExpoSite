import Botao from '@/components/ui/Botao'

export default function CTAFinal() {
  return (
    <section className="py-24 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
          Comece hoje, seu site<br />no ar em minutos
        </h2>
        <p className="text-violet-100 text-lg mb-10 max-w-xl mx-auto">
          7 dias grátis para testar. Sem cartão de crédito. Cancele quando quiser.
        </p>
        <Botao href="/cadastro" variante="fantasma" tamanho="lg">
          Criar meu site agora — é grátis por 7 dias
        </Botao>
        <p className="mt-6 text-violet-300 text-sm">
          Mais de 0 sites criados · Satisfação garantida
        </p>
      </div>
    </section>
  )
}
