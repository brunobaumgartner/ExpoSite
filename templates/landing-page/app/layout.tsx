import type { Metadata } from 'next'
import cfg from '../site.config.json'
import './globals.css'

const c = cfg as Record<string, unknown>

export const metadata: Metadata = {
  title: String(c.nome_negocio ?? 'Meu Negócio'),
  description: String(c.descricao ?? c.slogan ?? c.nome_negocio ?? ''),
}

const slug   = String(c._slug   ?? '')
const apiUrl = String(c._api_url ?? 'https://exposite.com.br')

const trackingScript = `
(function(){
  try {
    var d = JSON.stringify({slug:'${slug}',caminho:location.pathname,referrer:document.referrer||null});
    if(navigator.sendBeacon){navigator.sendBeacon('${apiUrl}/api/tracking/pageview',new Blob([d],{type:'application/json'}));}
    else{fetch('${apiUrl}/api/tracking/pageview',{method:'POST',headers:{'Content-Type':'application/json'},body:d,keepalive:true}).catch(function(){});}
  } catch(e){}
})();
`

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {slug && <script dangerouslySetInnerHTML={{ __html: trackingScript }} />}
      </body>
    </html>
  )
}
