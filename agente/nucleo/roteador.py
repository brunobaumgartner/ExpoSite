import logging
from telegram import Update
from telegram.ext import ContextTypes
from nucleo.autenticador import Autenticador
from nucleo.processador import Processador
from utilitarios.executor import Executor

logger = logging.getLogger(__name__)

_executor     = Executor()
_autenticador = Autenticador(_executor)
_processador  = Processador()


async def rotear(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handler principal: recebe qualquer mensagem e despacha para o processador."""
    if not update.message:
        return

    mensagem = update.message
    chat_id  = str(mensagem.chat_id)

    # Filtra apenas tipos de mensagem suportados
    tipos_suportados = (mensagem.text, mensagem.voice, mensagem.photo)
    if not any(tipos_suportados):
        await mensagem.reply_text('Só aceito textos, áudios e fotos. 🤖')
        return

    try:
        cliente = await _autenticador.autenticar(chat_id)
        await _processador.processar(mensagem, chat_id, cliente)
    except Exception as erro:
        logger.exception(f'Erro não tratado para chat_id={chat_id}: {erro}')
        await mensagem.reply_text('❌ Erro interno. Por favor, tente novamente em alguns instantes.')
