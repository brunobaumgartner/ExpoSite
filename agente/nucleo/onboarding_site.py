import json
import logging
from pathlib import Path
from telegram import Message
from utilitarios import contexto
from utilitarios.executor import Executor

logger = logging.getLogger(__name__)

SCHEMAS_DIR = Path('/app/templates')

CORES_NOMEADAS: dict[str, str] = {
    'vermelho': '#ef4444', 'azul': '#2563eb', 'verde': '#16a34a',
    'amarelo': '#ca8a04', 'roxo': '#7c3aed', 'rosa': '#ec4899',
    'laranja': '#ea580c', 'cinza': '#6b7280', 'preto': '#18181b',
    'branco': '#f9fafb', 'teal': '#0d9488', 'ciano': '#0891b2',
    'marrom': '#92400e', 'dourado': '#d97706',
}


def _cor_para_hex(valor: str) -> str:
    valor_limpo = valor.strip().lower()
    if valor_limpo in CORES_NOMEADAS:
        return CORES_NOMEADAS[valor_limpo]
    if valor_limpo.startswith('#') and len(valor_limpo) in (4, 7):
        return valor_limpo
    return f'#{valor_limpo.lstrip("#")[:6]}' if valor_limpo else '#2563eb'


def _carregar_schema(tipo_site: str) -> dict:
    arquivo = SCHEMAS_DIR / tipo_site / 'site.schema.json'
    if arquivo.exists():
        return json.loads(arquivo.read_text(encoding='utf-8'))
    logger.warning(f'Schema não encontrado para tipo_site={tipo_site}')
    return {'campos': {}}


def _proximo_campo(schema: dict, dados: dict) -> tuple[str, dict] | None:
    for nome, definicao in schema.get('campos', {}).items():
        if definicao.get('obrigatorio') and nome not in dados:
            return nome, definicao
    return None


class OnboardingSite:
    """Conduz a coleta de dados do site campo a campo via Telegram."""

    def __init__(self) -> None:
        self.executor = Executor()

    async def processar(self, mensagem: Message, chat_id: str, cliente: dict, texto: str) -> None:
        estado = contexto.obter(chat_id) or {}
        etapa  = estado.get('etapa', '')

        if etapa == '' or etapa == 'onboarding_ativado':
            await self._iniciar(mensagem, chat_id, cliente, estado)
            return

        if etapa == 'coletando_site':
            await self._coletar_campo(mensagem, chat_id, cliente, texto, estado)
            return

    async def _iniciar(self, mensagem: Message, chat_id: str, cliente: dict, estado: dict) -> None:
        tipo_site = cliente.get('tipo_site', 'landing-page')
        schema    = _carregar_schema(tipo_site)
        primeiro  = _proximo_campo(schema, {})

        if not primeiro:
            await mensagem.reply_text('✅ Seu site já está configurado! Me peça para fazer alterações quando quiser.')
            return

        estado.update({
            'etapa':      'coletando_site',
            'tipo_site':  tipo_site,
            'dados_site': {},
            'schema':     schema,
        })
        contexto.definir(chat_id, estado, ttl_segundos=7200)

        nome, definicao = primeiro
        await mensagem.reply_text(
            f'🌐 Vamos configurar o seu site! Vou fazer algumas perguntas rápidas.\n\n'
            f'*{definicao["pergunta"]}*',
            parse_mode='Markdown',
        )

    async def _coletar_campo(
        self, mensagem: Message, chat_id: str, cliente: dict, texto: str, estado: dict
    ) -> None:
        schema     = estado.get('schema', {})
        dados      = estado.get('dados_site', {})

        campo_atual = _proximo_campo(schema, dados)
        if not campo_atual:
            await self._finalizar(mensagem, chat_id, cliente, dados, estado)
            return

        nome, definicao = campo_atual

        if texto.strip().lower() in ('pular', 'skip', '-', 'não', 'nao') and not definicao.get('obrigatorio'):
            dados[nome] = None
        elif definicao.get('tipo') == 'cor':
            dados[nome] = _cor_para_hex(texto)
        else:
            dados[nome] = texto.strip()

        estado['dados_site'] = dados
        contexto.definir(chat_id, estado, ttl_segundos=7200)

        proximo = _proximo_campo(schema, dados)

        if proximo:
            _, prox_def = proximo
            await mensagem.reply_text(
                f'*{prox_def["pergunta"]}*',
                parse_mode='Markdown',
            )
        else:
            await self._finalizar(mensagem, chat_id, cliente, dados, estado)

    async def _finalizar(
        self, mensagem: Message, chat_id: str, cliente: dict, dados: dict, estado: dict
    ) -> None:
        await mensagem.reply_text('⏳ Ótimo! Salvando as informações e construindo seu site...')

        campos_limpos = {k: v for k, v in dados.items() if v is not None}

        resultado = await self.executor.atualizar_site(
            cliente_id=cliente['id'],
            campos=campos_limpos,
            mensagem='Onboarding inicial via Telegram',
        )

        contexto.limpar(chat_id)

        await mensagem.reply_text(
            resultado or f'🎉 *Site em construção!*\n\n'
                         f'Em alguns minutos estará disponível em:\n'
                         f'🌐 *{cliente["slug"]}.exposite.com.br*\n\n'
                         f'Quando quiser alterar algo, é só me dizer!',
            parse_mode='Markdown',
        )
