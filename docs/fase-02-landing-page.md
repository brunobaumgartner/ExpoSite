# ExpoSite — Fase 2: Landing Page da Plataforma

## Objetivo

Criar o site da própria plataforma ExpoSite em `exposite.com.br` — a página de marketing
onde os clientes descobrem o produto, entendem como funciona, veem os planos, o portfólio
e clicam em "Contratar". É o ponto de entrada do funil antes do cadastro e pagamento (Fase 3).

## Stack desta fase

| Tecnologia | Papel |
|---|---|
| Next.js 14 (App Router) | Framework do site — mesmo usado nos sites dos clientes |
| Tailwind CSS | Estilização |
| TypeScript | Tipagem |
| Framer Motion | Animações |
| Nginx | Serve o export estático em `exposite.com.br` |

**Por que Next.js e não Blade?**
Consistência com toda a plataforma — os templates dos clientes também são Next.js.
Animações e interatividade mais ricas. Exporta como HTML/CSS/JS estático (sem runtime Node).

---

## Seções da página

### 1. Header / Navbar
- Logo ExpoSite
- Links âncora: Como funciona · Tipos de site · Planos · Portfólio · FAQ
- CTA: "Criar meu site" → `/cadastro`

### 2. Hero
- Headline: "Crie seu site falando com o Telegram"
- Sub: "Sem conhecimento técnico. Sem agência. Sem mensalidade cara."
- CTA primário: "Criar meu site grátis por 7 dias"
- CTA secundário: "Ver como funciona ↓"
- Elemento visual: mockup animado de conversa no Telegram criando um site

### 3. Como funciona
3 passos em cards animados:
1. **Escolha seu plano** — selecione o tipo de site e o plano
2. **Converse no Telegram** — o agente cria e publica seu site em minutos
3. **Gerencie por mensagem** — atualize preços, fotos e textos falando ou digitando

### 4. Tipos de site
5 cards com preview, nome, descrição e módulos:
- Landing Page
- Institucional
- E-commerce
- Cardápio Digital
- Agendamento

### 5. Planos e preços
3 cards com destaque no Pro:

| | Básico | Pro ⭐ | Business |
|---|---|---|---|
| Preço | R$ 97/mês | R$ 197/mês | R$ 597/mês |
| Mensagens | 50/mês | 200/mês | 1.000/mês |
| Módulos | Site | Site + E-com + Agend. | Tudo |
| CTA | Contratar | Contratar | Contratar |

### 6. Portfólio / Exemplos
Grid de previews dos templates por tipo.
Inicialmente: mockups/screenshots dos 5 tipos de site.
Evolui para: links para demos reais conforme os templates são desenvolvidos.

### 7. Depoimentos
Inicialmente: seção oculta ou com placeholders.
Evolui para: depoimentos reais dos primeiros clientes.

### 8. FAQ
Perguntas frequentes:
- "Preciso saber programar?" → Não.
- "Como gerencio depois?" → Pelo mesmo Telegram.
- "E se eu quiser cancelar?" → Pode cancelar a qualquer hora, 30 dias de carência.
- "Meus dados ficam seguros?" → Cada cliente tem banco de dados isolado.
- "Funciona para qualquer negócio?" → Sim, temos 5 tipos de site.
- "Quanto tempo para o site ficar no ar?" → Minutos após o pagamento.

### 9. CTA Final
- Headline: "Comece hoje, seu site no ar em minutos"
- CTA: "Criar meu site agora"

### 10. Footer
- Logo + slogan
- Links: Início · Planos · Portfólio · FAQ · Política de Privacidade · Termos de Uso
- Contato: contato@exposite.com.br
- LGPD: aviso de cookies + link para política

---

## Estrutura de arquivos

```
landing/                    — raiz do projeto Next.js da landing page
  app/
    layout.tsx              — layout global (fonte, meta tags, analytics)
    page.tsx                — página principal (monta todas as seções)
    globals.css
  components/
    cabecalho/
      Navbar.tsx
    secoes/
      Hero.tsx
      ComoFunciona.tsx
      TiposDeSite.tsx
      Planos.tsx
      Portfolio.tsx
      Depoimentos.tsx
      FAQ.tsx
      CTAFinal.tsx
    rodape/
      Rodape.tsx
    ui/
      Botao.tsx
      CartaoPlano.tsx
      CartaoTipo.tsx
  public/
    imagens/
      logo.svg
      mockups/             — screenshots/previews dos templates
  next.config.ts           — output: 'export' (estático)
  tailwind.config.ts
  package.json
```

> A pasta `landing/` fica na raiz do repositório, ao lado de `backend/`, `agente/`,
> `templates/` e `sites/`.

---

## Decisões

- **Export estático** (`next export`) — sem runtime Node, servido pelo Nginx direto
- **Nginx** serve a landing em `exposite.com.br` e roteamento dinâmico para subdomínios
  de clientes (`*.exposite.com.br`) — configurado na Fase 5
- **Idioma** — português brasileiro em tudo (código, copy, nomes de componentes)
- **Responsivo** — mobile-first, testado em 375px, 768px e 1280px
- **Analytics** — placeholder para Google Analytics / Plausible (configurar na Fase 8)

---

## Agente da plataforma

Além do agente dos clientes (Fase 4), haverá um **agente administrativo** que permite
ao admin da plataforma gerenciar o ExpoSite pelo Telegram:

- Consultar métricas: novos clientes, receita, churn
- Suspender / reativar clientes
- Adicionar bots ao pool
- Ver erros e alertas em tempo real
- Resetar senha de cliente

Este agente será documentado e implementado junto com o Painel Admin (Fase 7).

---

## Etapas de implementação

### Etapa 1 — Criar o projeto Next.js

```bash
cd /d/caderno/exposite
npx create-next-app@latest landing \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd landing
npm install framer-motion
```

### Etapa 2 — Configurar export estático

`next.config.ts`:
```typescript
const config = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default config;
```

### Etapa 3 — Criar componentes e seções

Implementar cada seção listada acima como componente independente.

### Etapa 4 — Build e publicação

```bash
# Build estático
npm run build
# Gera a pasta 'out/'

# Copiar para o diretório servido pelo Nginx na VPS
rsync -av out/ root@144.91.70.44:/srv/exposite/landing-dist/
```

### Etapa 5 — Configurar Nginx para a landing

Atualizar `infra/nginx/conf.d/exposite.conf` para servir a landing no domínio raiz
e a API Laravel no prefixo `/api`.

### Etapa 6 — Testes da landing

- Responsividade em mobile (375px), tablet (768px) e desktop (1280px)
- Todos os links âncora funcionando
- CTA aponta para `/cadastro` (rota criada na Fase 3)
- Lighthouse: performance > 90, acessibilidade > 90

---

## Checklist da Fase 2

- [ ] Projeto Next.js criado em `landing/`
- [ ] Export estático configurado
- [ ] Navbar com links e CTA
- [ ] Seção Hero com mockup
- [ ] Seção Como Funciona (3 passos)
- [ ] Seção Tipos de Site (5 cards)
- [ ] Seção Planos e Preços (3 cards)
- [ ] Seção Portfólio (mockups dos templates)
- [ ] Seção FAQ
- [ ] CTA Final
- [ ] Footer com links e LGPD
- [ ] Responsivo em 375px, 768px e 1280px
- [ ] Build estático sem erros
- [ ] Publicado e acessível em `http://144.91.70.44`
- [ ] Nginx atualizado para servir a landing
- [ ] Agente da plataforma documentado (implementação na Fase 7)

**Fase 2 concluída → partir para a Fase 3 (Pagamento e Onboarding)**
