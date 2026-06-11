import os
from dotenv import load_dotenv

load_dotenv()


class Configuracao:
    telegram_token:    str  = os.getenv('TELEGRAM_TOKEN', '')
    telegram_secret:   str  = os.getenv('TELEGRAM_WEBHOOK_SECRET', '')
    openai_chave:      str  = os.getenv('OPENAI_CHAVE', '')
    api_url:           str  = os.getenv('API_URL', 'http://backend:9000')
    api_token_interno: str  = os.getenv('API_TOKEN_INTERNO', '')
    redis_url:         str  = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    modo:              str  = os.getenv('AGENTE_MODO', 'polling')   # polling | webhook
    webhook_url:       str  = os.getenv('WEBHOOK_URL', '')
    whisper_modelo:    str  = os.getenv('WHISPER_MODELO', 'small')

    @property
    def pronto(self) -> bool:
        return bool(self.telegram_token and self.openai_chave and self.api_token_interno)


configuracao = Configuracao()
