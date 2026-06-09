# Decisões Arquiteturais

## 001 — Schema por cliente no MySQL

**Decisão:** cada cliente tem um schema MySQL próprio (`cliente_{slug}`).

**Motivo:** isolamento físico real entre clientes, sem risco de vazamento de dados por bug de query.
Facilita backup individual, exclusão LGPD e futura migração para instância dedicada.

**Alternativa descartada:** tabelas compartilhadas com `cliente_id` — risco de cross-tenant por bug.

---

## 002 — Bot Telegram centralizado com pool de tokens

**Decisão:** um único worker Python gerencia todos os bots via webhook centralizado.
Tokens pré-criados ficam em pool na tabela `bot_pool`.

**Motivo:** custo de infra fixo independente do número de clientes.
Isolamento garantido por código (7 camadas de proteção).

**Alternativa descartada:** processo Python por cliente — custo cresce linearmente.

---

## 003 — GPT-4o mini como LLM

**Decisão:** GPT-4o mini para interpretação de intenções do agente.

**Motivo:** custo ~R$0,001 por mensagem, qualidade suficiente para comandos em português.
Whisper roda local (gratuito, offline, ~250MB RAM).

**Alternativa futura:** Llama 3 local via Ollama quando o volume justificar o hardware.

---

## 004 — SOLID como padrão de design

**Decisão:** arquitetura em módulos com Controlador/Serviço/Repositório/DTO e interfaces base.

**Motivo:** permite adicionar novos módulos sem modificar código existente (OCP).
Facilita testes e manutenção de longo prazo.

---

## 005 — Filas Redis para operações pesadas

**Decisão:** provisionamento de cliente, rebuild de site e envio de emails via filas Redis.

**Motivo:** operações que levam segundos não podem bloquear a requisição HTTP.
Redis garante persistência e retry automático em caso de falha.

---

## 006 — Next.js static export para sites dos clientes

**Decisão:** sites gerados como HTML/CSS/JS estático via `next export`.

**Motivo:** sem custo de runtime Node.js por cliente. Nginx serve arquivos estáticos com
latência mínima. Versionamento simples — cada rebuild é uma pasta nova.

---

## 007 — Mercado Pago para pagamentos

**Decisão:** Mercado Pago como gateway de pagamento.

**Motivo:** sem mensalidade fixa, taxa apenas por transação aprovada.
Amplamente usado no Brasil, documentação completa em português.

---

## 008 — Deploy manual nas Fases 1–6, GitHub Actions na Fase 7

**Decisão:** durante o desenvolvimento (Fases 1–6) o deploy é manual via `git pull` na VPS.
Na Fase 7 (Hardening) migra para GitHub Actions com deploy automático no push para `main`.

**Motivo:** nas fases iniciais há muitos ajustes de infra que exigem controle manual.
Automação só faz sentido quando a estrutura está estável.

---

## 009 — Nomenclatura de classes em português puro

**Decisão:** classes com nomes descritivos em português sem sufixos em inglês (Service, Provider, Repository).
Exceção: `Controlador` (sufixo necessário para convenção Laravel) e `Interface` (mesmo nas duas línguas).

**Motivo:** consistência com a regra "tudo em português" do projeto.

**Exemplos:**
- `GerenciadorCliente` (não `TenantService`)
- `RegistradorModulos` (não `ModulosServiceProvider`)
- `RepositorioCliente` (não `ClienteRepository`)
- `ClienteControlador` (sufixo mantido por convenção Laravel)
