# Plataforma SaaS — Fase 3: Agente Telegram

## Objetivo
Worker Python rodando como serviço, recebendo mensagens de voz, texto e foto
pelo Telegram, identificando o tenant pelo chat_id, transcrevendo áudio com
Whisper local, interpretando a intenção com GPT-4o mini e executando as ações
via API Laravel. Tudo com isolamento total entre tenants.

## Dependências
- Fase 1 e Fase 2 concluídas
- Tokens de bots no pool preenchidos
- Chave da API OpenAI (GPT-4o mini)
- Whisper instalado localmente

---

## Etapa 1 — Criar estrutura do agente

```bash
cd /srv/plataforma/agente

mkdir -p \
  nucleo \
  intencoes/core \
  intencoes/site \
  intencoes/ecommerce \
  intencoes/agendamento \
  modelos \
  utilitarios
```

**Por que essa estrutura?**
O agente é dividido em `nucleo` (lógica central do bot, autenticação, roteamento),
`intencoes` (ações disponíveis por módulo) e `utilitarios` (Whisper, cliente HTTP).
Novos módulos entram adicionando uma pasta em `intencoes/` sem tocar no núcleo —
Open/Closed do SOLID aplicado ao Python.

---

## Etapa 2 — Criar o requirements.txt

Crie `/srv/plataforma/agente/requirements.txt`:

```txt
python-telegram-bot==21.3
openai-whisper==20231117
openai==1.35.0
httpx==0.27.0
python-dotenv==1.0.1
redis==5.0.6
pydantic==2.7.4
pytz==2024.1
```

---

## Etapa 3 — Criar o Dockerfile do agente

Crie `/srv/plataforma/infra/docker/agente.Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Dependências para o Whisper (ffmpeg para processar áudio)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app/agente

COPY agente/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixa o modelo Whisper small na build para não baixar em runtime
RUN python -c "import whisper; whisper.load_model('small')"

COPY agente/ .
```

**Por que baixar o modelo Whisper na build?**
O modelo `small` tem ~250MB. Baixar durante o build garante que o container
inicia instantaneamente em produção, sem esperar o download. O modelo fica
em cache na imagem Docker.

---

## Etapa 4 — Adicionar o agente ao docker-compose

No `/srv/plataforma/infra/docker-compose.yml`, adicione:

```yaml
  agente:
    build:
      context: ..
      dockerfile: infra/docker/agente.Dockerfile
    container_name: plataforma_agente
    restart: unless-stopped
    command: python -m nucleo.worker
    environment:
      - TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET}
      - OPENAI_CHAVE=${OPENAI_CHAVE}
      - API_URL=http://backend:8000
      - API_TOKEN_INTERNO=${API_TOKEN_INTERNO}
      - REDIS_URL=redis://:${REDIS_SENHA}@redis:6379/0
    volumes:
      - ../agente:/app/agente
    depends_on:
      - backend
      - redis
    networks:
      - rede_interna
```

---

## Etapa 5 — Criar o worker principal

Crie `/srv/plataforma/agente/nucleo/worker.py`:

```python
import logging
from telegram.ext import Application, MessageHandler, filters
from nucleo.roteador import Roteador
from utilitarios.configuracao import configuracao

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

def iniciar() -> None:
    """
    Inicializa o worker do Telegram com webhook centralizado.
    Todos os bots do pool registram webhook para este mesmo worker.
    """
    aplicacao = Application.builder().token(configuracao.token_principal).build()

    roteador = Roteador()

    aplicacao.add_handler(MessageHandler(filters.TEXT, roteador.processar))
    aplicacao.add_handler(MessageHandler(filters.VOICE, roteador.processar))
    aplicacao.add_handler(MessageHandler(filters.PHOTO, roteador.processar))

    aplicacao.run_webhook(
        listen='0.0.0.0',
        port=8443,
        webhook_url=f"{configuracao.webhook_url}/webhook",
        secret_token=configuracao.webhook_secret,
    )

if __name__ == '__main__':
    iniciar()
```

---

## Etapa 6 — Criar o roteador de mensagens

Crie `/srv/plataforma/agente/nucleo/roteador.py`:

```python
import logging
from telegram import Update
from telegram.ext import ContextTypes
from nucleo.autenticador import Autenticador
from nucleo.processador import Processador

logger = logging.getLogger(__name__)

class Roteador:
    """
    Recebe todas as mensagens do Telegram e as encaminha para o
    processador correto após autenticar o tenant.
    """

    def __init__(self) -> None:
        self.autenticador = Autenticador()
        self.processador  = Processador()

    async def processar(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """
        Ponto de entrada de toda mensagem recebida.
        Autentica o tenant antes de qualquer ação.
        """
        chat_id = str(update.effective_chat.id)

        tenant = await self.autenticador.autenticar(chat_id)

        if not tenant:
            logger.warning(f"Mensagem de chat_id não registrado: {chat_id}")
            return

        if not tenant['ativo']:
            await update.message.reply_text(
                "⚠️ Sua conta está suspensa. Acesse o painel para reativar."
            )
            return

        if not tenant['tem_mensagens_disponiveis']:
            await update.message.reply_text(
                "⚠️ Você atingiu o limite de mensagens do seu plano este mês. "
                "Acesse o painel para fazer upgrade."
            )
            return

        await self.processador.processar(update, tenant)
```

---

## Etapa 7 — Criar o autenticador de tenant

Crie `/srv/plataforma/agente/nucleo/autenticador.py`:

```python
import httpx
import logging
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

class Autenticador:
    """
    Identifica e valida o tenant pelo chat_id do Telegram.
    Consulta a API Laravel para obter os dados do tenant.
    """

    async def autenticar(self, chat_id: str) -> dict | None:
        """
        Retorna os dados do tenant se o chat_id estiver registrado e ativo.
        Retorna None se o chat_id não pertencer a nenhum tenant.
        """
        try:
            async with httpx.AsyncClient() as cliente:
                resposta = await cliente.get(
                    f"{configuracao.api_url}/interno/tenants/por-chat/{chat_id}",
                    headers={'Authorization': f'Bearer {configuracao.api_token_interno}'},
                    timeout=5.0,
                )

            if resposta.status_code == 404:
                return None

            resposta.raise_for_status()
            return resposta.json()

        except httpx.RequestError as erro:
            logger.error(f"Erro ao autenticar tenant pelo chat_id {chat_id}: {erro}")
            return None
```

---

## Etapa 8 — Criar o processador de mensagens

Crie `/srv/plataforma/agente/nucleo/processador.py`:

```python
import logging
from telegram import Update
from utilitarios.transcritor import Transcritor
from utilitarios.interpretador import Interpretador
from utilitarios.executor import Executor

logger = logging.getLogger(__name__)

class Processador:
    """
    Processa a mensagem do cliente: transcreve voz se necessário,
    interpreta a intenção via LLM e executa a ação correspondente.
    """

    def __init__(self) -> None:
        self.transcritor   = Transcritor()
        self.interpretador = Interpretador()
        self.executor      = Executor()

    async def processar(self, update: Update, tenant: dict) -> None:
        """
        Orquestra o fluxo completo de processamento de uma mensagem.
        """
        mensagem = update.message

        # Extrai o conteúdo da mensagem independente do tipo
        if mensagem.voice:
            texto = await self.transcritor.transcrever(mensagem.voice)
            tipo  = 'voz'
        elif mensagem.photo:
            texto = mensagem.caption or ''
            foto  = mensagem.photo[-1]  # maior resolução
            tipo  = 'foto'
        else:
            texto = mensagem.text
            tipo  = 'texto'

        if not texto and tipo != 'foto':
            await mensagem.reply_text("Não entendi. Pode repetir?")
            return

        # Interpreta a intenção com o LLM
        intencao = await self.interpretador.interpretar(
            texto=texto,
            tenant=tenant,
            tipo=tipo,
        )

        if not intencao:
            await mensagem.reply_text(
                "Não consegui entender o que você quer fazer. Pode explicar diferente?"
            )
            return

        # Executa a ação e retorna a resposta
        resposta = await self.executor.executar(
            intencao=intencao,
            tenant=tenant,
            foto=foto if tipo == 'foto' else None,
        )

        await mensagem.reply_text(resposta)
```

---

## Etapa 9 — Criar o transcritor (Whisper local)

Crie `/srv/plataforma/agente/utilitarios/transcritor.py`:

```python
import whisper
import tempfile
import os
import logging
from telegram import Voice

logger = logging.getLogger(__name__)

class Transcritor:
    """
    Transcreve mensagens de voz do Telegram usando Whisper local.
    O modelo roda completamente offline — nenhum áudio sai do servidor.
    """

    def __init__(self) -> None:
        self.modelo = whisper.load_model('small')

    async def transcrever(self, voz: Voice) -> str:
        """
        Baixa o arquivo de voz e transcreve para texto em português.
        """
        arquivo_voz = await voz.get_file()

        with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as arquivo_temp:
            await arquivo_voz.download_to_drive(arquivo_temp.name)
            caminho = arquivo_temp.name

        try:
            resultado = self.modelo.transcribe(caminho, language='pt')
            return resultado['text'].strip()
        except Exception as erro:
            logger.error(f"Erro na transcrição: {erro}")
            return ''
        finally:
            os.unlink(caminho)
```

---

## Etapa 10 — Criar o interpretador (GPT-4o mini)

Crie `/srv/plataforma/agente/utilitarios/interpretador.py`:

```python
import json
import logging
from openai import AsyncOpenAI
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

PROMPT_SISTEMA = """
Você é um assistente que ajuda donos de pequenos negócios a gerenciar
seus sites e lojas. Interprete o comando do usuário e retorne APENAS
um JSON com a intenção identificada, no formato:

{
  "acao": "nome_da_acao",
  "parametros": {}
}

Ações disponíveis para este tenant: {acoes_disponiveis}

Se não conseguir identificar a intenção, retorne:
{"acao": "desconhecida", "parametros": {}}

Responda APENAS com o JSON. Sem explicações.
"""

class Interpretador:
    """
    Interpreta a intenção do usuário usando GPT-4o mini.
    O contexto é isolado por tenant — nunca há mistura de dados.
    """

    def __init__(self) -> None:
        self.cliente = AsyncOpenAI(api_key=configuracao.openai_chave)

    async def interpretar(self, texto: str, tenant: dict, tipo: str) -> dict | None:
        """
        Envia o texto para o LLM e retorna a intenção estruturada.
        """
        acoes = self._acoes_disponiveis(tenant)

        prompt = PROMPT_SISTEMA.format(acoes_disponiveis=', '.join(acoes))

        try:
            resposta = await self.cliente.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': prompt},
                    {'role': 'user',   'content': texto},
                ],
                max_tokens=200,
                temperature=0,
            )

            conteudo = resposta.choices[0].message.content.strip()
            return json.loads(conteudo)

        except (json.JSONDecodeError, Exception) as erro:
            logger.error(f"Erro ao interpretar intenção: {erro}")
            return None

    def _acoes_disponiveis(self, tenant: dict) -> list[str]:
        """
        Retorna as ações disponíveis conforme os módulos ativos do tenant.
        """
        acoes = ['consultar_plano', 'consultar_uso', 'ajuda']

        modulos = tenant.get('modulos', [])

        if 'site' in modulos:
            acoes += ['atualizar_site', 'ver_versoes', 'rollback_site']

        if 'ecommerce' in modulos or 'cardapio' in modulos:
            acoes += ['criar_produto', 'editar_produto', 'remover_produto', 'consultar_estoque']

        if 'agendamento' in modulos:
            acoes += ['ver_agenda', 'criar_agendamento', 'cancelar_agendamento']

        return acoes
```

---

## Etapa 11 — Criar o executor de ações

Crie `/srv/plataforma/agente/utilitarios/executor.py`:

```python
import httpx
import logging
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

RESPOSTAS_ERRO = {
    'desconhecida': "Não entendi o comando. Pode tentar de outra forma?",
    'sem_permissao': "Esta ação não está disponível no seu plano.",
    'erro_api': "Ocorreu um erro ao executar sua solicitação. Tente novamente.",
}

class Executor:
    """
    Executa a ação interpretada chamando a API Laravel do backend.
    Todo resultado é registrado na auditoria pelo backend.
    """

    async def executar(self, intencao: dict, tenant: dict, foto=None) -> str:
        """
        Chama o endpoint correto da API Laravel para a ação solicitada.
        Retorna a mensagem de resposta para o usuário.
        """
        acao = intencao.get('acao', 'desconhecida')

        if acao == 'desconhecida':
            return RESPOSTAS_ERRO['desconhecida']

        payload = {
            'acao':      acao,
            'parametros': intencao.get('parametros', {}),
            'origem':    'agente',
        }

        try:
            async with httpx.AsyncClient() as cliente:
                resposta = await cliente.post(
                    f"{configuracao.api_url}/interno/tenants/{tenant['id']}/acoes",
                    json=payload,
                    headers={'Authorization': f'Bearer {configuracao.api_token_interno}'},
                    timeout=15.0,
                )

            if resposta.status_code == 403:
                return RESPOSTAS_ERRO['sem_permissao']

            resposta.raise_for_status()
            dados = resposta.json()
            return dados.get('mensagem', '✅ Feito!')

        except httpx.RequestError as erro:
            logger.error(f"Erro ao executar ação {acao} para tenant {tenant['id']}: {erro}")
            return RESPOSTAS_ERRO['erro_api']
```

---

## Etapa 12 — Criar o endpoint interno da API Laravel

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/AgenteController.php`:

```php
<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Services\AgenteService;
use App\Modules\Core\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgenteController extends Controller
{
    public function __construct(
        private readonly AgenteService $agenteService,
        private readonly TenantService $tenantService,
    ) {}

    /**
     * Endpoint interno chamado pelo agente Python para executar ações.
     * Autenticado por token interno — não exposto publicamente.
     */
    public function executarAcao(Request $request, int $tenantId): JsonResponse
    {
        $request->validate([
            'acao'       => 'required|string',
            'parametros' => 'array',
            'origem'     => 'required|in:agente,painel,sistema',
        ]);

        $tenant = \App\Modules\Core\Models\Tenant::findOrFail($tenantId);

        $this->tenantService->configurarConexao($tenant);

        $resultado = $this->agenteService->executar(
            tenant:     $tenant,
            acao:       $request->input('acao'),
            parametros: $request->input('parametros', []),
            origem:     $request->input('origem'),
        );

        return response()->json($resultado);
    }

    /**
     * Retorna os dados do tenant a partir do chat_id do Telegram.
     */
    public function buscarPorChatId(string $chatId): JsonResponse
    {
        $tenant = $this->agenteService->buscarTenantPorChatId($chatId);

        if (!$tenant) {
            return response()->json(['mensagem' => 'Não encontrado.'], 404);
        }

        return response()->json($tenant);
    }
}
```

---

## Etapa 13 — Criar as rotas internas

Adicione em `/srv/plataforma/backend/app/Modules/Core/routes/api.php`:

```php
// Rotas internas — acessadas apenas pelo agente Python
// Autenticadas por token interno (não pelo Sanctum do cliente)
Route::middleware('auth.interno')->prefix('interno')->group(function () {
    Route::get('tenants/por-chat/{chatId}', [AgenteController::class, 'buscarPorChatId']);
    Route::post('tenants/{tenantId}/acoes', [AgenteController::class, 'executarAcao']);
});
```

---

## Etapa 14 — Registrar o webhook dos bots

```bash
# Para cada bot do pool, registrar o webhook apontando para o worker
# Este script é executado quando um novo bot é adicionado ao pool

curl -X POST \
  "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seudominio.com.br/webhook",
    "secret_token": "{TELEGRAM_WEBHOOK_SECRET}",
    "allowed_updates": ["message"]
  }'
```

---

## Checklist final da Fase 3

- [ ] Estrutura de diretórios do agente criada
- [ ] `requirements.txt` criado
- [ ] `agente.Dockerfile` criado com Whisper pré-baixado
- [ ] Container do agente adicionado ao docker-compose
- [ ] `worker.py` criado (ponto de entrada)
- [ ] `Roteador` criado (recebe e valida mensagens)
- [ ] `Autenticador` criado (identifica tenant pelo chat_id)
- [ ] `Processador` criado (orquestra voz/texto/foto)
- [ ] `Transcritor` criado (Whisper local, offline)
- [ ] `Interpretador` criado (GPT-4o mini, contexto isolado por tenant)
- [ ] `Executor` criado (chama API Laravel)
- [ ] `AgenteController` criado no Laravel
- [ ] Rotas internas criadas e protegidas por token interno
- [ ] Webhook registrado nos bots do pool
- [ ] Teste end-to-end: mensagem de voz → transcrição → intenção → resposta
- [ ] Isolamento confirmado: tenant A não acessa dados do tenant B

**Fase 3 concluída → partir para a Fase 4 (Sites e Templates)**
