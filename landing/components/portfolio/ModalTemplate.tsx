import { motion } from 'framer-motion'
import type { Exemplo, TipoSite } from './tipos'
import TemplateLandingPage  from './modelos/landing_page'
import TemplateAgendamento  from './modelos/agendamento'
import TemplateCardapio     from './modelos/cardapio'
import TemplateEcommerce    from './modelos/ecommerce'
import TemplateInstitucional from './modelos/institucional'

function TemplateConteudo({ ex }: { ex: Exemplo }) {
  const mapa: Record<TipoSite, React.ReactNode> = {
    'Landing Page':  <TemplateLandingPage  ex={ex} />,
    'Agendamento':   <TemplateAgendamento  ex={ex} />,
    'Cardápio':      <TemplateCardapio     ex={ex} />,
    'E-commerce':    <TemplateEcommerce    ex={ex} />,
    'Institucional': <TemplateInstitucional ex={ex} />,
  }
  return <>{mapa[ex.tipo]}</>
}

export default function ModalTemplate({ ex, onFechar }: { ex: Exemplo; onFechar: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onFechar}
    >
      <motion.div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-3 border-b border-slate-200">
          <div className="flex gap-1.5">
            <button onClick={onFechar} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono flex items-center gap-1">
            <span className="text-slate-300">🔒</span> {ex.slug}.exposite.com.br
          </div>
          <span className="text-xs text-slate-400 font-medium">{ex.tipo}</span>
        </div>

        <div className="h-[72vh] overflow-y-auto overscroll-contain">
          <TemplateConteudo ex={ex} />
        </div>
      </motion.div>
    </motion.div>
  )
}
