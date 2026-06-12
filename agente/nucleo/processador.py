import logging
from telegram import Message
from utilitarios.configuracao import configuracao
from utilitarios.transcritor import Transcritor
from utilitarios.interpretador import Interpretador
from utilitarios.executor import Executor
from utilitarios import contexto
from intencoes.catalogo import acoes_para_cliente
from nucleo.onboarding_site import OnboardingSite

logger = logging.getLogger(__name__)

MENSAGEM_BOAS_VINDAS = """\
👋 Olá! Eu sou o assistente do ExpoSite.

Para ativar sua conta, preciso que você informe o **e-mail** que usou no cadastro em exposite.com.br.

📧 Qual é o seu e-mail?
"""

MENSAGEM_SUSPENSA = """\
⚠️ Sua conta está suspensa.

Acesse o painel em *exposite.com.br* para reativar ou entre em contato com o suporte.
"""

MENSAGEM_SEM_CREDITO = """\
⚠️ Você atingiu o limite de mensagens do seu plano este mês.

Acesse *exposite.com.br* para fazer upgrade do plano.
"""


class Processador:
    """Orquestra o fluxo completo: transcrição → interpretação → execução."""

    def __init__(self) -> None:
        self.transcritor       = Transcritor(configuracao.whisper_modelo)
        self.interpretador     = Interpretador()
        self.executor          = Executor()
        self.onboarding_site   = OnboardingSite()

    async def processar(self, mensagem: Message, chat_id: str, cliente: dict | None) -> None:
        texto = await self._extrair_texto(mensagem)

        # Cliente não encontrado → fluxo de onboarding
        if cliente is None:
            await self._onboarding(mensagem, chat_id, texto)
            return

        # Conta suspensa ou sem crédito
        if cliente.get('suspenso'):
            await mensagem.reply_text(MENSAGEM_SUSPENSA, parse_mode='Markdown')
            return

        if cliente.get('sem_credito'):
            await mensagem.reply_text(MENSAGEM_SEM_CREDITO, parse_mode='Markdown')
            return

        # Fluxo normal: interpreta e executa
        await self._processar_comando(mensagem, texto, cliente)

    async def _extrair_texto(self, mensagem: Message) -> str:
        if mensagem.voice:
            return await self.transcritor.transcrever(mensagem.voice)
        if mensagem.photo:
            return mensagem.caption or ''
        return mensagem.text or ''

    async def _onboarding(self, mensagem: Message, chat_id: str, texto: str) -> None:
        estado = contexto.obter(chat_id)

        if estado is None:
            contexto.definir(chat_id, {'etapa': 'aguardando_email', 'dados': {}})
            await mensagem.reply_text(MENSAGEM_BOAS_VINDAS, parse_mode='Markdown')
            return

        etapa = estado.get('etapa')

        if etapa == 'aguardando_email':
            await self._onboarding_verificar_email(mensagem, chat_id, texto, estado)

        elif etapa == 'aguardando_confirmacao':
            await self._onboarding_confirmar(mensagem, chat_id, texto, estado)

    async def _onboarding_verificar_email(
        self, mensagem: Message, chat_id: str, texto: str, estado: dict
    ) -> None:
        email = texto.strip().lower()

        pre_registro = await self.executor.buscar_pre_registro_por_email(email)

        if not pre_registro:
            await mensagem.reply_text(
                '❌ E-mail não encontrado.\n\n'
                'Verifique se digitou corretamente ou acesse *exposite.com.br/cadastro* para se cadastrar.',
                parse_mode='Markdown',
            )
            return

        if pre_registro.get('status') != 'confirmado':
            await mensagem.reply_text(
                '⚠️ Seu e-mail ainda não foi confirmado.\n\n'
                'Verifique sua caixa de entrada e clique no link de confirmação que enviamos.',
            )
            return

        estado['etapa'] = 'aguardando_confirmacao'
        estado['dados']['pre_registro_id'] = pre_registro['id']
        estado['dados']['email']           = email
        estado['dados']['nome']            = pre_registro['nome']
        estado['dados']['nome_empresa']    = pre_registro['nome_empresa']
        estado['dados']['tipo_site']       = pre_registro['tipo_site']
        estado['dados']['slug']            = pre_registro['slug_desejado']
        contexto.definir(chat_id, estado)

        tipo_label = {
            'landing-page': '🎯 Landing Page',
            'institucional': '🏢 Institucional',
            'ecommerce': '🛒 E-commerce',
            'cardapio': '🍽️ Cardápio Digital',
            'agendamento': '📅 Agendamento',
        }.get(pre_registro['tipo_site'], pre_registro['tipo_site'])

        await mensagem.reply_text(
            f'✅ Encontrei seu cadastro!\n\n'
            f'👤 *{pre_registro["nome"]}*\n'
            f'🏢 {pre_registro["nome_empresa"]}\n'
            f'🌐 {pre_registro["slug_desejado"]}.exposite.com.br\n'
            f'📋 {tipo_label}\n\n'
            f'É você? Responda *sim* para ativar sua conta.',
            parse_mode='Markdown',
        )

    async def _onboarding_confirmar(
        self, mensagem: Message, chat_id: str, texto: str, estado: dict
    ) -> None:
        resposta = texto.strip().lower()

        if resposta not in ('sim', 's', 'yes', 'confirmar', 'confirmo', '👍'):
            await mensagem.reply_text('Responda *sim* para confirmar ou me diga o e-mail correto para recomeçar.', parse_mode='Markdown')
            return

        pre_registro_id = estado['dados']['pre_registro_id']
        resultado       = await self.executor.ativar_cliente(pre_registro_id, chat_id)

        if not resultado:
            await mensagem.reply_text('❌ Ocorreu um erro ao ativar sua conta. Tente novamente em alguns minutos.')
            return

        contexto.definir(chat_id, {'etapa': 'onboarding_ativado', 'dados': {}}, ttl_segundos=7200)

        nome_empresa = estado['dados']['nome_empresa']
        slug         = estado['dados']['slug']

        await mensagem.reply_text(
            f'🎉 *Conta ativada com sucesso!*\n\n'
            f'Bem-vindo ao ExpoSite, *{estado["dados"]["nome"]}*!\n\n'
            f'Agora vamos configurar o seu site *{nome_empresa}*.\n'
            f'São poucas perguntas — pode responder em texto ou áudio! 🎙️',
            parse_mode='Markdown',
        )

    async def _processar_comando(self, mensagem: Message, texto: str, cliente: dict) -> None:
        chat_id = str(mensagem.chat_id)
        estado  = contexto.obter(chat_id)

        # Se o cliente está no meio do onboarding do site, continua o fluxo
        if estado and estado.get('etapa') == 'coletando_site':
            await self.onboarding_site.processar(mensagem, chat_id, cliente, texto)
            return

        # Se o cliente acabou de ativar a conta e ainda não tem site configurado
        if estado and estado.get('etapa') == 'onboarding_ativado':
            await self.onboarding_site.processar(mensagem, chat_id, cliente, texto)
            return

        if not texto:
            await mensagem.reply_text('Não entendi. Pode repetir? 🤔')
            return

        modulos  = cliente.get('modulos', [])
        acoes    = acoes_para_cliente(modulos)
        intencao = await self.interpretador.interpretar(texto, acoes)
        resposta = await self.executor.executar(
            acao=intencao['acao'],
            parametros=intencao.get('parametros', {}),
            cliente_id=cliente['id'],
            tokens_usados=intencao.get('_tokens', 0),
        )

        await mensagem.reply_text(resposta, parse_mode='Markdown')
