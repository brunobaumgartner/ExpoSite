import json
import logging
from openai import AsyncOpenAI
from utilitarios.configuracao import configuracao

logger = logging.getLogger(__name__)

PROMPT_SISTEMA = """\
Você é um assistente que ajuda donos de pequenos negócios a gerenciar
seus sites e lojas via Telegram. Interprete o comando do usuário e retorne
APENAS um JSON com a intenção identificada, no formato:

{{"acao": "nome_da_acao", "parametros": {{}}}}

Ações disponíveis para este cliente: {acoes}

Exemplos de mapeamento:
- "Muda o título para Barbearia Top" → {{"acao": "atualizar_site", "parametros": {{"campo": "titulo", "valor": "Barbearia Top"}}}}
- "Adiciona pizza calabresa por 45 reais" → {{"acao": "criar_produto", "parametros": {{"nome": "Pizza Calabresa", "preco": 45}}}}
- "Quantas mensagens tenho?" → {{"acao": "consultar_uso", "parametros": {{}}}}
- "Ver meu plano" → {{"acao": "consultar_plano", "parametros": {{}}}}

Se não conseguir identificar, retorne: {{"acao": "desconhecida", "parametros": {{}}}}
Responda APENAS com o JSON. Sem explicações, sem markdown.
"""


class Interpretador:
    """Mapeia texto livre para ação estruturada usando GPT-4o mini."""

    def __init__(self) -> None:
        self.cliente = AsyncOpenAI(api_key=configuracao.openai_chave)

    async def interpretar(self, texto: str, acoes_disponiveis: list[str]) -> dict:
        prompt = PROMPT_SISTEMA.format(acoes=', '.join(acoes_disponiveis))

        try:
            resposta = await self.cliente.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': prompt},
                    {'role': 'user',   'content': texto},
                ],
                max_tokens=200,
                temperature=0,
                response_format={'type': 'json_object'},
            )
            conteudo = resposta.choices[0].message.content.strip()
            return json.loads(conteudo)

        except json.JSONDecodeError as erro:
            logger.error(f'JSON inválido do GPT: {erro}')
            return {'acao': 'desconhecida', 'parametros': {}}
        except Exception as erro:
            logger.error(f'Erro ao interpretar intenção: {erro}')
            return {'acao': 'desconhecida', 'parametros': {}}
