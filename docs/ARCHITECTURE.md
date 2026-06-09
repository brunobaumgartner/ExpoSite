# Arquitetura do ExpoSite

## Visão geral

Plataforma SaaS multi-cliente para criação e gestão de sites por voz e texto via Telegram.
Cada cliente tem seu próprio subdomínio, bot Telegram e schema de banco de dados isolado.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 11 + MySQL 8 + Redis |
| Agente | Python 3.11 + Whisper local + GPT-4o mini |
| Sites dos clientes | Next.js (export estático) |
| Painel | Vue 3 + Inertia + Tailwind |
| Infra | Docker Compose + Nginx + Contabo VPS |

## Fluxo principal

```
Cliente fala no Telegram (voz ou texto)
        ↓
Worker Python — identifica cliente pelo chat_id
        ↓
[Se voz] Whisper local transcreve → texto
        ↓
GPT-4o mini interpreta a intenção
        ↓
API interna Laravel executa a ação
        ↓
MySQL schema do cliente (isolado)
        ↓
[Se site] RebuildSiteJob → Next.js build → Nginx serve
        ↓
Resposta no Telegram
```

## Isolamento multi-cliente

Cada cliente tem um schema MySQL próprio (`cliente_{slug}`).
O middleware `IdentificarCliente` detecta o cliente pelo subdomínio e configura
a conexão `cliente` antes de qualquer query.

```
Banco central (schema: plataforma)
  planos, clientes, cliente_configs, bot_pool, faturas, cadastros_pendentes, admins

Schema por cliente (schema: cliente_{slug})
  usuarios, auditoria, site_versoes
  [módulo ecommerce] produtos, categorias, pedidos
  [módulo agendamento] servicos, agendamentos, horarios_disponiveis
```

## Módulos

| Módulo | Responsabilidade |
|---|---|
| Core | Cliente, auth, billing, auditoria, bot pool |
| Site | Templates, config, versionamento, rebuild |
| Ecommerce | Produtos, categorias, pedidos |
| Agendamento | Serviços, agenda, horários |
| Cardapio | Herda Ecommerce com config de cardápio |

## Padrão de camadas

```
Controlador → Serviço → Repositório → Model
DTOs trafegam entre todas as camadas.
Nunca expor Model fora da camada de dados.
```

## Containers Docker

| Container | Papel |
|---|---|
| exposite_nginx | Reverse proxy + wildcard subdomínio |
| exposite_backend | Laravel 11 PHP-FPM |
| exposite_banco | MySQL 8 |
| exposite_redis | Redis |
| exposite_queue | Laravel queue worker |
| exposite_agente | Worker Python (Telegram + Whisper + LLM) |
| exposite_monitoramento | Uptime Kuma |
