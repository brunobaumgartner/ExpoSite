import json
import logging
import redis as redis_lib
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

_cliente_redis: redis_lib.Redis | None = None


def _redis() -> redis_lib.Redis:
    global _cliente_redis
    if _cliente_redis is None:
        _cliente_redis = redis_lib.from_url(configuracao.redis_url, decode_responses=True)
    return _cliente_redis


def _chave(chat_id: str) -> str:
    return f'agente:estado:{chat_id}'


def obter(chat_id: str) -> dict | None:
    try:
        valor = _redis().get(_chave(chat_id))
        return json.loads(valor) if valor else None
    except Exception as erro:
        logger.error(f'Erro ao ler contexto Redis ({chat_id}): {erro}')
        return None


def definir(chat_id: str, estado: dict, ttl_segundos: int = 3600) -> None:
    try:
        _redis().setex(_chave(chat_id), ttl_segundos, json.dumps(estado))
    except Exception as erro:
        logger.error(f'Erro ao salvar contexto Redis ({chat_id}): {erro}')


def limpar(chat_id: str) -> None:
    try:
        _redis().delete(_chave(chat_id))
    except Exception as erro:
        logger.error(f'Erro ao limpar contexto Redis ({chat_id}): {erro}')
