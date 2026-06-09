# ExpoSite — Contexto do Projeto

## O que é
Plataforma SaaS multi-tenant para criação e gestão de sites por voz e texto
via Telegram. O cliente conversa com um agente, que cria e gerencia o site
automaticamente. Cada cliente tem seu próprio subdomínio, agente Telegram
e banco de dados isolado.

---

## Regras de desenvolvimento

- Claude explica o que vai fazer → Bruno aprova → Claude executa
- Nada é executado sem aprovação explícita
- Tudo em português — variáveis, métodos, classes, funções, rotas, colunas, arquivos
- Sem comentários inline — apenas docblocks em métodos e funções
- Sem redundância — cada coisa existe uma vez, no lugar certo
- SOLID em todo o código (SRP, OCP, LSP, ISP, DIP)
- Segurança e LGPD como fundação, não afterthought
- Modularidade, flexibilidade e escalabilidade em cada decisão
- Documentação gerada junto com o código

---

## Infraestrutura

| Item | Valor |
|---|---|
| Provedor | Contabo |
| Sistema | Ubuntu 22.04 LTS |
| CPU | 4 vCPU |
| RAM | 8 GB |
| Disco | 150 GB SSD |
| Domínio | exposite.com.br |
| Subdomínios | cliente.exposite.com.br |
| Diretório | /srv/exposite |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 11 |
| Banco central | MySQL 8 (schema `plataforma`) |
| Banco por tenant | MySQL 8 (schema `tenant_{slug}`) |
| Cache e filas | Redis |
| Painel | Vue 3 + Inertia + Tailwind |
| Sites dos clientes | Next.js (templates estáticos) |
| Agente | Python 3.11 |
| Bot Telegram | python-telegram-bot |
| Transcrição de voz | Whisper local (modelo small) |
| LLM | GPT-4o mini (OpenAI) |
| Pagamentos | Mercado Pago |
| Proxy | Nginx |
| Orquestração | Docker Compose |
| CI/CD | GitHub Actions |

---

## Arquitetura geral

```
Cliente fala no Telegram (voz ou texto)
        ↓
Worker Python — identifica tenant pelo chat_id
        ↓
[Se voz] Whisper local transcreve → texto
        ↓
GPT-4o mini interpreta a intenção
        ↓
API interna Laravel executa a ação
        ↓
MySQL schema do tenant (isolado)
        ↓
[Se site] RebuildSiteJob → Next.js build → Nginx serve
        ↓
Resposta no Telegram
```

---

## Estrutura de repositórios

```
/srv/exposite/
  backend/          — Laravel 11 (API + painéis)
  agente/           — Worker Python (bot + Whisper + LLM)
  templates/        — Templates Next.js por tipo de site
    landing-page/
    institucional/
    ecommerce/
    cardapio/
    agendamento/
  infra/            — Docker Compose + Nginx + scripts
    docker/
    nginx/
    scripts/
  docs/             — Documentação geral
  sites/            — Sites gerados dos tenants (servidos pelo Nginx)
```

---

## Estrutura do backend (Laravel)

```
backend/
  app/
    Modules/
      Core/           — tenant, auth, billing, auditoria, bot pool
      Site/           — templates, config, versionamento, rebuild
      Ecommerce/      — produtos, categorias, pedidos
      Agendamento/    — serviços, agenda, horários
      Cardapio/       — herda Ecommerce com config diferente
    Interfaces/
      RepositorioInterface.php
      RepositorioLeituraInterface.php
      RepositorioEscritaInterface.php
    Http/
      Middleware/
        IdentificarTenant.php
        AutenticarPainel.php
        AutenticarAdmin.php
  database/
    migrations/
      (banco central)
      Core/           — migrations do schema tenant
      Site/
      Ecommerce/
      Agendamento/
```

### Padrão de camadas obrigatório
```
Controller → Service → Repository → Model
DTOs trafegam entre todas as camadas
Nunca passar Model cru fora da camada de dados
```

---

## Estrutura do agente (Python)

```
agente/
  nucleo/
    worker.py       — ponto de entrada, webhook Telegram
    roteador.py     — recebe mensagens, identifica tipo
    autenticador.py — valida tenant pelo chat_id
    processador.py  — orquestra voz/texto/foto
    onboarding.py   — coleta dados para criação do site
  intencoes/
    core/           — consultar plano, uso, ajuda
    site/           — atualizar site, rollback, versões
    ecommerce/      — CRUD de produtos, consultar estoque
    agendamento/    — ver agenda, criar, cancelar
  utilitarios/
    transcritor.py  — Whisper local
    interpretador.py — GPT-4o mini
    executor.py     — chama API Laravel
    configuracao.py — variáveis de ambiente
```

---

## Multi-tenancy

Cada tenant tem um schema MySQL próprio (`tenant_{slug}`).

```sql
-- Banco central
plataforma.tenants
plataforma.planos
plataforma.tenant_configs
plataforma.bot_pool
plataforma.faturas
plataforma.cadastros_pendentes
plataforma.admins

-- Schema por tenant (criado no onboarding)
tenant_barbearia_joao.site_config
tenant_barbearia_joao.site_versoes
tenant_barbearia_joao.usuarios
tenant_barbearia_joao.auditoria
tenant_barbearia_joao.produtos        -- módulo ecommerce/cardapio
tenant_barbearia_joao.categorias
tenant_barbearia_joao.pedidos
tenant_barbearia_joao.servicos        -- módulo agendamento
tenant_barbearia_joao.agendamentos
tenant_barbearia_joao.horarios_disponiveis
```

O middleware `IdentificarTenant` detecta o tenant pelo subdomínio e
configura a conexão para o schema correto antes de qualquer query.

---

## Segurança — 7 camadas

1. **Autenticação por chat_id** — toda mensagem valida o tenant antes de qualquer ação
2. **Contexto isolado** — LLM nunca recebe dados de outro tenant
3. **Queries com tenant verificado** — dupla camada além do schema isolado
4. **Ações por escopo** — agente só executa ações do plano ativo do tenant
5. **Rate limiting** — por tenant, por minuto e por mês (conforme plano)
6. **Auditoria** — toda ação registrada com origem, usuário, payload e resultado
7. **Validação de intenções** — LLM não executa diretamente, sempre passa pela validação

---

## Planos

| Plano | Preço mensal | Mensagens/mês | Produtos | Agendamentos | Módulos |
|---|---|---|---|---|---|
| Básico | R$ 97 | 50 | — | — | site |
| Pro | R$ 197 | 200 | 100 | 100 | site + ecommerce + agendamento |
| Business | R$ 597 | 1.000* | ilimitado | ilimitado | tudo |

*Fair use — excedente R$ 0,50/msg

---

## Tipos de site (templates)

| Tipo | Módulos ativos |
|---|---|
| landing-page | core + site |
| institucional | core + site |
| ecommerce | core + site + ecommerce |
| cardapio | core + site + ecommerce (sem pedidos) |
| agendamento | core + site + agendamento |

---

## Fluxo de cadastro

```
Cliente acessa exposite.com.br
        ↓
Escolhe tipo de site + plano
        ↓
Preenche dados + verifica slug em tempo real
        ↓
Cadastra cartão → Mercado Pago
        ↓
Pagamento aprovado → webhook MP
        ↓
ProvisionarTenantJob (fila):
  - Cria schema tenant_{slug}
  - Roda migrations do módulo
  - Atribui bot do pool
  - Cria usuário admin
  - Registra fatura
  - Envia email de boas-vindas com link Telegram
        ↓
Cliente entra no Telegram → agente inicia onboarding
        ↓
Site criado e publicado em slug.exposite.com.br
```

---

## Ciclo de vida do tenant

```
ativo → suspenso (vencimento sem renovação) → reativado (pagamento)
ativo → cancelado (solicitação) → carência 30 dias → excluído
```

---

## LGPD

- Consentimento explícito no cadastro (checkbox não pré-marcado)
- Exportação de dados disponível no painel (portabilidade)
- Solicitação de exclusão disponível no painel (direito ao esquecimento)
- Exclusão real após 30 dias de carência (schema dropado)
- Logs de auditoria anonimizados, não deletados
- Informação sobre uso de Whisper local e GPT-4o mini na política
- DPO: dpo@exposite.com.br

---

## Fases de desenvolvimento

| Fase | Descrição | Arquivo |
|---|---|---|
| 1 | Fundação — Laravel, Docker, multi-tenancy, auth | docs/fase-01-fundacao.md |
| 2 | Landing page da plataforma — Next.js estático | docs/fase-02-landing-page.md |
| 3 | Pagamento e onboarding — MP, provisionamento, emails | docs/fase-03-pagamento-onboarding.md |
| 4 | Agente Telegram — Python, Whisper, GPT-4o mini | docs/fase-04-agente-telegram.md |
| 5 | Sites e templates — Next.js, Nginx, versionamento | docs/fase-05-sites-templates.md |
| 6 | Painel do cliente — Vue 3, Inertia, LGPD | docs/fase-06-painel-cliente.md |
| 7 | Painel admin — métricas, pool, planos + agente da plataforma | docs/fase-07-painel-admin.md |
| 8 | Hardening e produção — segurança, backup, CI/CD | docs/fase-08-hardening-producao.md |
| — | Implantação do zero | docs/implantacao.md |

---

## Decisões arquiteturais

| # | Decisão |
|---|---|
| 001 | Schema por tenant no MySQL (isolamento físico) |
| 002 | Bot Telegram centralizado com pool de tokens pré-criados |
| 003 | GPT-4o mini como LLM (custo ~R$0,001/msg) |
| 004 | Whisper local modelo small (gratuito, offline, ~250MB RAM) |
| 005 | SOLID como padrão — Controller/Service/Repository/DTO |
| 006 | Filas Redis para operações pesadas (provisionamento, rebuild) |
| 007 | Next.js static export para sites dos clientes |
| 008 | Mercado Pago para pagamentos (sem mensalidade, taxa por transação) |

---

## Variáveis de ambiente relevantes

```env
APP_URL=https://exposite.com.br
APP_DOMINIO=exposite.com.br
BD_USUARIO=exposite_usuario
API_TOKEN_INTERNO=     # token para comunicação agente → API
TELEGRAM_WEBHOOK_SECRET=
OPENAI_CHAVE=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
```

---

## Comandos úteis

> **Atenção:** sempre usar `--env-file .env` com `-f infra/docker-compose.yml`.
> O Docker Compose v5 procura o `.env` no diretório do arquivo compose (`infra/`),
> não na raiz do projeto.

```bash
# Subir todos os containers (rodar da raiz /srv/exposite)
docker compose -f infra/docker-compose.yml --env-file .env up -d

# Ver logs em tempo real
docker compose -f infra/docker-compose.yml --env-file .env logs -f

# Rodar migrations do banco central
docker exec exposite_backend php artisan migrate --force

# Limpar e recriar caches do Laravel
docker exec exposite_backend php artisan optimize:clear
docker exec exposite_backend php artisan optimize

# Acessar tinker
docker exec -it exposite_backend php artisan tinker

# Ver filas
docker exec exposite_backend php artisan queue:monitor

# Backup manual
/srv/exposite/infra/scripts/backup.sh
```

---

## Containers Docker

| Container | Papel |
|---|---|
| exposite_nginx | Reverse proxy + wildcard subdomínio |
| exposite_backend | Laravel 11 PHP-FPM |
| exposite_banco | MySQL 8 |
| exposite_redis | Redis 7 (pinado — Redis 8 quebra --requirepass) |
| exposite_queue | Laravel queue worker |
| exposite_agente | Worker Python (Telegram + Whisper + LLM) |
| exposite_monitoramento | Uptime Kuma |
