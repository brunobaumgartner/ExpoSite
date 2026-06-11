import whisper
import tempfile
import os
import logging
from telegram import Voice

logger = logging.getLogger(__name__)


class Transcritor:
    """Transcreve mensagens de voz usando Whisper local — nenhum áudio sai do servidor."""

    def __init__(self, modelo: str = 'small') -> None:
        logger.info(f'Carregando modelo Whisper "{modelo}"...')
        self.modelo = whisper.load_model(modelo)
        logger.info('Modelo Whisper pronto.')

    async def transcrever(self, voz: Voice) -> str:
        arquivo_voz = await voz.get_file()

        with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as tmp:
            await arquivo_voz.download_to_drive(tmp.name)
            caminho = tmp.name

        try:
            resultado = self.modelo.transcribe(caminho, language='pt')
            texto = resultado['text'].strip()
            logger.info(f'Transcrição: "{texto[:80]}..."')
            return texto
        except Exception as erro:
            logger.error(f'Erro na transcrição Whisper: {erro}')
            return ''
        finally:
            os.unlink(caminho)
