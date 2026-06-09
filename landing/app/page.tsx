import Navbar from '@/components/cabecalho/Navbar'
import Hero from '@/components/secoes/Hero'
import ComoFunciona from '@/components/secoes/ComoFunciona'
import TiposDeSite from '@/components/secoes/TiposDeSite'
import Planos from '@/components/secoes/Planos'
import Portfolio from '@/components/secoes/Portfolio'
import FAQ from '@/components/secoes/FAQ'
import CTAFinal from '@/components/secoes/CTAFinal'
import Rodape from '@/components/rodape/Rodape'

export default function Pagina() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ComoFunciona />
        <TiposDeSite />
        <Planos />
        <Portfolio />
        <FAQ />
        <CTAFinal />
      </main>
      <Rodape />
    </>
  )
}
