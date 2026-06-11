ACOES_POR_MODULO: dict[str, dict[str, str]] = {
    'core': {
        'consultar_plano':  'Consultar detalhes do plano atual (nome, preço, recursos)',
        'consultar_uso':    'Consultar quantas mensagens foram usadas neste mês',
        'ajuda':            'Listar o que o assistente pode fazer',
    },
    'site': {
        'atualizar_site':   'Atualizar conteúdo ou aparência do site (título, descrição, cores, textos)',
        'ver_versoes':      'Ver histórico de versões publicadas do site',
        'rollback_site':    'Reverter o site para uma versão anterior',
        'publicar_site':    'Publicar as alterações pendentes do site',
    },
    'ecommerce': {
        'criar_produto':    'Criar um novo produto com nome, preço e descrição',
        'editar_produto':   'Editar nome, preço ou descrição de um produto existente',
        'remover_produto':  'Remover um produto do catálogo',
        'consultar_estoque':'Ver produtos cadastrados e seus estoques',
    },
    'cardapio': {
        'criar_produto':    'Adicionar um item ao cardápio com nome, preço e descrição',
        'editar_produto':   'Editar um item do cardápio',
        'remover_produto':  'Remover um item do cardápio',
        'consultar_estoque':'Ver itens do cardápio cadastrados',
    },
    'agendamento': {
        'ver_agenda':           'Ver os agendamentos do dia ou semana',
        'criar_agendamento':    'Criar um novo horário disponível para agendamento',
        'cancelar_agendamento': 'Cancelar um agendamento existente',
        'bloquear_horario':     'Bloquear um horário para que clientes não possam agendar',
    },
}


def acoes_para_cliente(modulos: list[str]) -> list[str]:
    """Retorna a lista de ações disponíveis com base nos módulos ativos do cliente."""
    acoes: list[str] = list(ACOES_POR_MODULO['core'].keys())

    for modulo in modulos:
        if modulo in ACOES_POR_MODULO:
            acoes += list(ACOES_POR_MODULO[modulo].keys())

    return list(dict.fromkeys(acoes))
