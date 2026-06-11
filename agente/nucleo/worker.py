import logging
import sys
from telegram.ext import ApplicationBuilder, MessageHandler, filters
from utilitarios.configuracao import configuracao
from nucleo.roteador import rotear

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(name)-30s  %(levelname)s  %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def iniciar() -> None:
    if not configuracao.pronto:
        faltando = []
        if not configuracao.telegram_token:
            faltando.append('TELEGRAM_TOKEN')
        if not configuracao.openai_chave:
            faltando.append('OPENAI_CHAVE')
        if not configuracao.api_token_interno:
            faltando.append('API_TOKEN_INTERNO')
        logger.error(f'Variáveis de ambiente ausentes: {", ".join(faltando)}')
        sys.exit(1)

    app = (
        ApplicationBuilder()
        .token(configuracao.telegram_token)
        .build()
    )

    app.add_handler(
        MessageHandler(
            filters.TEXT | filters.VOICE | filters.PHOTO,
            rotear,
        )
    )

    if configuracao.modo == 'webhook' and configuracao.webhook_url:
        logger.info(f'Iniciando em modo webhook: {configuracao.webhook_url}')
        app.run_webhook(
            listen='0.0.0.0',
            port=8443,
            url_path=configuracao.telegram_token,
            webhook_url=f'{configuracao.webhook_url}/{configuracao.telegram_token}',
            secret_token=configuracao.telegram_secret or None,
        )
    else:
        logger.info('Iniciando em modo polling (sem domínio/SSL necessário)')
        app.run_polling(drop_pending_updates=True)


if __name__ == '__main__':
    iniciar()
