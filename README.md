# ExpoSite

Plataforma SaaS para criação e gestão de sites por voz e texto via Telegram.
O cliente conversa com um agente inteligente que cria, publica e gerencia
o site automaticamente — sem conhecimento técnico necessário.

---

## Como funciona

```
Cliente fala no Telegram → Agente cria o site → Publicado em minutos
```

Após a criação, o cliente gerencia tudo pelo mesmo Telegram ou pelo painel web:
- *"Muda o preço do corte para R$45"*
- *"Adiciona um produto novo com essa foto"*
- *"Quais agendamentos tenho amanhã?"*
- *"Volta o site como estava ontem"*

---

## Tipos de site

| Tipo | Descrição |
|---|---|
| Landing page | Página única para apresentação do negócio |
| Institucional | Site com múltiplas seções e informações |
| E-commerce | Loja online com produtos e pedidos |
| Cardápio digital | Menu com categorias e itens |
| Agendamento | Site com sistema de agendamento de serviços |

---

## Planos

| Plano | Mensalidade | Mensagens/mês | Módulos |
|---|---|---|---|
| Básico | R$ 97 | 50 | Site |
| Pro | R$ 197 | 200 | Site + E-commerce + Agendamento |
| Business | R$ 597 | 1.000 | Tudo + Templates premium |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 11 |
| Banco de dados | MySQL 8 (schema por tenant) |
| Cache e filas | Redis |
| Painel web | Vue 3 + Inertia + Tailwind |
| Sites dos clientes | Next.js (export estático) |
| Agente | Python 3.11 |
| Transcrição de voz | Whisper (local, offline) |
| LLM | GPT-4o mini |
| Pagamentos | Mercado Pago |
| Proxy | Nginx |
| Orquestração | Docker Compose |

---

## Pré-requisitos

- Ubuntu 22.04 LTS
- Docker + Docker Compose
- Node.js 22+
- Domínio com suporte a wildcard DNS
- Conta no Mercado Pago (API de pagamentos)
- Chave da API OpenAI
- Bots criados no Telegram via @BotFather

---

## Instalação

Consulte o guia completo de implantação:

```
docs/implantacao.md
```

Resumo dos passos:

```bash
# 1. Clone o repositório
git clone https://github.com/seunome/exposite.git /srv/exposite
cd /srv/exposite

# 2. Configure o ambiente
cp .env.exemplo .env
nano .env

# 3. Suba os containers
docker compose -f infra/docker-compose.yml up -d

# 4. Rode as migrations
docker exec -it exposite_backend php artisan migrate --force

# 5. Otimize para produção
docker exec -it exposite_backend php artisan optimize

# 6. Crie o primeiro admin
docker exec -it exposite_backend php artisan tinker
```

---

## Estrutura do projeto

```
exposite/
  backend/          — Laravel 11 (API + painéis admin e cliente)
  agente/           — Worker Python (Telegram + Whisper + GPT-4o mini)
  templates/        — Templates Next.js por tipo de site
  infra/            — Docker Compose, Nginx e scripts
  docs/             — Documentação completa por fase
  sites/            — Sites gerados dos clientes (servidos pelo Nginx)
  CLAUDE.md         — Contexto do projeto para o Claude CLI
  README.md         — Este arquivo
```

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| `docs/implantacao.md` | Guia de implantação do zero |
| `docs/fase-01-fundacao.md` | Fundação — Laravel, Docker, multi-tenancy |
| `docs/fase-02-landing-page.md` | Landing page da plataforma — Next.js |
| `docs/fase-03-pagamento-onboarding.md` | Pagamento e provisionamento automático |
| `docs/fase-04-agente-telegram.md` | Agente Telegram, Whisper e LLM |
| `docs/fase-05-sites-templates.md` | Geração e publicação de sites |
| `docs/fase-06-painel-cliente.md` | Painel web do cliente |
| `docs/fase-07-painel-admin.md` | Painel administrativo + agente da plataforma |
| `docs/fase-08-hardening-producao.md` | Segurança, backup e CI/CD |
| `docs/ARCHITECTURE.md` | Arquitetura geral do sistema |
| `docs/DECISIONS.md` | Decisões arquiteturais registradas |

---

## Segurança e LGPD

- Isolamento físico entre tenants via schema MySQL por cliente
- 7 camadas de proteção no agente centralizado
- Dados sensíveis criptografados em repouso
- HTTPS obrigatório com certificado wildcard
- Portal do titular: exportação e exclusão de dados pelo painel
- Whisper roda localmente — nenhum áudio sai do servidor
- Auditoria completa de todas as ações por tenant

---

## Desenvolvimento

O projeto é desenvolvido com o Claude CLI seguindo o fluxo:

```
Claude explica → Bruno aprova → Claude executa
```

Padrões obrigatórios:
- Tudo em português (variáveis, métodos, rotas, colunas)
- SOLID em todo o código
- Sem comentários inline — apenas docblocks
- Sem redundância
- Documentação gerada junto com o código

---

## Licença

Proprietário — todos os direitos reservados.
