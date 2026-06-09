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

---

## 010 — Planos por caso de uso, não por tamanho

**Decisão:** 4 planos segmentados por tipo de negócio, não por "pequeno/médio/grande".

| Plano | Valor | Tarefas/mês | Foco |
|---|---|---|---|
| Institucional | R$ 99 | 100 | Sites de conteúdo e captação de leads |
| Service & Agendamento | R$ 139 | 200 | Barbearias, salões, clínicas |
| E-commerce Starter | R$ 159 | 250 | Pequenas lojas virtuais |
| E-commerce Avançado | R$ 299 | 600 | Lojas consolidadas e equipes |

**Motivo:** cliente escolhe pelo problema que tem, não pelo quanto pode pagar.
Reduz confusão e aumenta conversão no cadastro.

**Alternativa descartada:** planos Básico/Pro/Business — genéricos demais, forçam o cliente a
raciocinar sobre "tamanho" em vez de "necessidade".

---

## 011 — Tarefas como unidade de consumo (não mensagens)

**Decisão:** cada ação completada pelo agente conta como 1 tarefa.
Uma conversa de 5 mensagens que resulta em 1 alteração = 1 tarefa consumida.

**Motivo:** mais justo para o cliente (não penaliza quem precisa de mais contexto para explicar)
e mais simples de comunicar ("100 tarefas/mês" vs "100 mensagens/mês").

**Custo real:** GPT-4o mini + Whisper ≈ R$ 0,003 por tarefa. Margem elevada em todos os planos.

---

## 012 — Pacotes avulsos de tarefas via Inline Keyboard Telegram

**Decisão:** quando o cliente atinge o limite mensal, o bot responde automaticamente com
uma mensagem estruturada e botões Inline Keyboard com opções de upgrade ou compra avulsa.

Pacotes avulsos (válidos apenas no mês corrente):
- +10 tarefas: R$ 15,00
- +20 tarefas: R$ 25,00
- +30 tarefas: R$ 35,00

**Motivo:** permite monetização adicional sem forçar mudança de plano. Custo real de
~R$ 0,03 para 10 tarefas — margem de 500x. Cliente percebe como conveniência, não punição.

**Implementação:** agente Python verifica contador antes de processar cada mensagem.
Se `tarefas_usadas >= limite_plano`, dispara o fluxo de Inline Keyboard em vez de processar.
Pagamento avulso via Mercado Pago (mesmo fluxo da Fase 3).

**Alternativa descartada:** cobrar por mensagem excedente automaticamente — invasivo e
gera chargebacks.
