import logging
from utilitarios.executor import Executor

logger = logging.getLogger(__name__)


class Autenticador:
    """Identifica o cliente pelo chat_id consultando a API interna do backend."""

    def __init__(self, executor: Executor) -> None:
        self.executor = executor

    async def autenticar(self, chat_id: str) -> dict | None:
        """
        Retorna os dados do cliente se o chat_id estiver registrado e ativo.
        Retorna None se o chat_id não pertencer a nenhum cliente.
        """
        cliente = await self.executor.buscar_cliente_por_chat(chat_id)

        if not cliente:
            return None

        if not cliente.get('ativo', False):
            logger.warning(f'Cliente inativo tentou usar o bot: chat_id={chat_id}')
            return {'suspenso': True, **cliente}

        if not cliente.get('tem_mensagens_disponiveis', True):
            return {'sem_credito': True, **cliente}

        return cliente
