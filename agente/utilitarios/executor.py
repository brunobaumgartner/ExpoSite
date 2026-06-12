import httpx
import logging
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

MENSAGENS_ERRO = {
    'desconhecida':  'Não entendi o comando. Pode tentar de outra forma? 🤔',
    'sem_permissao': '⚠️ Esta ação não está disponível no seu plano.',
    'erro_api':      '❌ Ocorreu um erro ao executar sua solicitação. Tente novamente.',
}

_HEADERS = lambda: {'Authorization': f'Bearer {configuracao.api_token_interno}'}


class Executor:
    """Chama a API interna do Laravel para executar a ação identificada."""

    async def executar(self, acao: str, parametros: dict, cliente_id: int) -> str:
        if acao == 'desconhecida':
            return MENSAGENS_ERRO['desconhecida']

        payload = {'acao': acao, 'parametros': parametros, 'origem': 'agente'}

        try:
            async with httpx.AsyncClient() as http:
                resposta = await http.post(
                    f'{configuracao.api_url}/api/interno/clientes/{cliente_id}/acoes',
                    json=payload,
                    headers=_HEADERS(),
                    timeout=15.0,
                )

            if resposta.status_code == 403:
                return MENSAGENS_ERRO['sem_permissao']

            resposta.raise_for_status()
            dados = resposta.json()
            return dados.get('mensagem', '✅ Feito!')

        except httpx.RequestError as erro:
            logger.error(f'Erro ao executar ação "{acao}" para cliente {cliente_id}: {erro}')
            return MENSAGENS_ERRO['erro_api']

    async def buscar_cliente_por_chat(self, chat_id: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as http:
                resposta = await http.get(
                    f'{configuracao.api_url}/api/interno/clientes/por-chat/{chat_id}',
                    headers=_HEADERS(),
                    timeout=5.0,
                )
            if resposta.status_code == 404:
                return None
            resposta.raise_for_status()
            return resposta.json()
        except Exception as erro:
            logger.error(f'Erro ao buscar cliente pelo chat_id {chat_id}: {erro}')
            return None

    async def buscar_pre_registro_por_email(self, email: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as http:
                resposta = await http.get(
                    f'{configuracao.api_url}/api/interno/pre-registros/por-email/{email}',
                    headers=_HEADERS(),
                    timeout=5.0,
                )
            if resposta.status_code == 404:
                return None
            resposta.raise_for_status()
            return resposta.json()
        except Exception as erro:
            logger.error(f'Erro ao buscar pré-registro ({email}): {erro}')
            return None

    async def atualizar_site(self, cliente_id: int, campos: dict, mensagem: str = '') -> str | None:
        try:
            async with httpx.AsyncClient() as http:
                resposta = await http.post(
                    f'{configuracao.api_url}/api/interno/clientes/{cliente_id}/site/atualizar',
                    json={'campos': campos, 'mensagem': mensagem},
                    headers=_HEADERS(),
                    timeout=30.0,
                )
            resposta.raise_for_status()
            return resposta.json().get('mensagem')
        except Exception as erro:
            logger.error(f'Erro ao atualizar site (cliente {cliente_id}): {erro}')
            return None

    async def ativar_cliente(self, pre_registro_id: int, chat_id: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as http:
                resposta = await http.post(
                    f'{configuracao.api_url}/api/interno/pre-registros/{pre_registro_id}/ativar',
                    json={'chat_id': chat_id},
                    headers=_HEADERS(),
                    timeout=30.0,
                )
            resposta.raise_for_status()
            return resposta.json()
        except Exception as erro:
            logger.error(f'Erro ao ativar cliente (pre_registro {pre_registro_id}): {erro}')
            return None
