<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\LogAtividade;
use App\Modules\Core\Models\Plano;
use App\Modules\Core\Models\PreRegistro;
use App\Modules\Site\Services\GerenciadorSite;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GerenciadorAgente
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciadorCliente,
        private readonly GerenciadorSite    $gerenciadorSite,
    ) {}

    public function buscarClientePorChat(string $chatId): ?array
    {
        $cliente = Cliente::with('plano')
            ->where('telegram_chat_id', $chatId)
            ->first();

        if (!$cliente) {
            return null;
        }

        $plano = $cliente->plano;

        return [
            'id'                      => $cliente->id,
            'nome'                    => $cliente->nome,
            'nome_empresa'            => $cliente->nome_empresa,
            'slug'                    => $cliente->slug,
            'subdominio'              => $cliente->subdominio,
            'tipo_site'               => $cliente->tipo_site,
            'status'                  => $cliente->status,
            'ativo'                   => $cliente->estaAtivo(),
            'modulos'                 => $plano?->modulos ?? [],
            'tem_mensagens_disponiveis' => $this->temMensagensDisponiveis($cliente, $plano),
            'plano'                   => $plano ? [
                'nome'             => $plano->nome,
                'limite_mensagens' => $plano->limite_mensagens,
            ] : null,
            'mensagens_usadas_mes'    => $cliente->mensagens_usadas_mes,
        ];
    }

    public function buscarPreRegistroPorEmail(string $email): ?array
    {
        $registro = PreRegistro::where('email', $email)->latest()->first();

        if (!$registro) {
            return null;
        }

        return [
            'id'            => $registro->id,
            'nome'          => $registro->nome,
            'nome_empresa'  => $registro->nome_empresa,
            'email'         => $registro->email,
            'tipo_site'     => $registro->tipo_site,
            'slug_desejado' => $registro->slug_desejado,
            'status'        => $registro->status,
        ];
    }

    public function ativarCliente(int $preRegistroId, string $chatId): array
    {
        $registro = PreRegistro::findOrFail($preRegistroId);

        return DB::transaction(function () use ($registro, $chatId) {
            $plano = Plano::where('ativo', true)->orderBy('preco_mensal')->firstOrFail();

            $cliente = Cliente::create([
                'slug'                => $registro->slug_desejado,
                'email'               => $registro->email,
                'password'            => Hash::make($registro->senha),
                'nome'                => $registro->nome,
                'nome_empresa'        => $registro->nome_empresa,
                'tipo_site'           => $registro->tipo_site,
                'subdominio'          => $registro->slug_desejado . '.' . config('app.domain', 'exposite.com.br'),
                'plano_id'            => $plano->id,
                'telegram_chat_id'    => $chatId,
                'status'              => 'ativo',
                'mensagens_usadas_mes'=> 0,
            ]);

            $modulos = $this->gerenciadorCliente->modulosPorTipo($registro->tipo_site);
            $this->gerenciadorCliente->provisionar($cliente, $modulos);

            $this->gerenciadorCliente->criarUsuarioAdmin($cliente, [
                'nome'     => $registro->nome,
                'email'    => $registro->email,
                'senha'    => $registro->senha,
                'telefone' => $registro->telefone,
            ]);

            $registro->update(['status' => 'ativado']);

            return ['cliente_id' => $cliente->id, 'slug' => $cliente->slug];
        });
    }

    public function executarAcao(string $acao, array $parametros, int $clienteId, int $tokensUsados = 0): string
    {
        $cliente = Cliente::with('plano')->findOrFail($clienteId);

        $resposta = match ($acao) {
            'consultar_plano' => $this->resumoPlano($cliente),
            'consultar_uso'   => $this->resumoUso($cliente),
            'ajuda'           => $this->textoAjuda($cliente),
            'atualizar_site'  => $this->gerenciadorSite->atualizar($cliente, $parametros, 'Atualização via agente'),
            'ver_versoes'     => $this->gerenciadorSite->listarVersoes($cliente),
            'rollback_site'   => isset($parametros['versao_id'])
                ? $this->gerenciadorSite->rollback($cliente, (int) $parametros['versao_id'])
                : '⚠️ Informe o número da versão. Ex: "rollback versão 3"',
            'publicar_site'   => $this->gerenciadorSite->atualizar($cliente, [], 'Publicação manual'),
            default           => $this->acaoPendente($acao),
        };

        $this->gerenciadorCliente->configurarConexao($cliente);

        LogAtividade::create([
            'tipo'          => str_contains($acao, 'site') ? 'atualizacao_site' : 'mensagem',
            'acao'          => $acao,
            'descricao'     => $resposta,
            'tokens_usados' => $tokensUsados,
            'status'        => 'sucesso',
        ]);

        $cliente->increment('mensagens_usadas_mes');

        if ($tokensUsados > 0) {
            $cliente->increment('tokens_usados_mes', $tokensUsados);
        }

        return $resposta;
    }

    private function temMensagensDisponiveis(Cliente $cliente, ?Plano $plano): bool
    {
        if (!$plano || $plano->limite_mensagens === 0) {
            return true;
        }

        return $cliente->mensagens_usadas_mes < $plano->limite_mensagens;
    }

    private function resumoPlano(Cliente $cliente): string
    {
        $plano = $cliente->plano;

        if (!$plano) {
            return '⚠️ Nenhum plano encontrado. Entre em contato com o suporte.';
        }

        $limite = $plano->limite_mensagens === 0 ? 'ilimitadas' : $plano->limite_mensagens;

        return "📋 *Seu plano: {$plano->nome}*\n"
            . "💬 Mensagens por mês: {$limite}\n"
            . "🛍️ Produtos cadastráveis: {$plano->limite_produtos}\n"
            . "📅 Agendamentos: {$plano->limite_agendamentos}";
    }

    private function resumoUso(Cliente $cliente): string
    {
        $plano  = $cliente->plano;
        $usadas = $cliente->mensagens_usadas_mes;
        $limite = $plano?->limite_mensagens;

        if (!$limite) {
            return "💬 Você usou *{$usadas} mensagens* este mês. Sem limite no seu plano.";
        }

        $restantes = max(0, $limite - $usadas);

        return "💬 Você usou *{$usadas}* de *{$limite}* mensagens este mês.\n"
            . "✅ Restam *{$restantes}* mensagens.";
    }

    private function textoAjuda(Cliente $cliente): string
    {
        return "🤖 *O que posso fazer por você:*\n\n"
            . "📊 *Ver informações*\n"
            . "• \"Ver meu plano\"\n"
            . "• \"Quantas mensagens usei?\"\n\n"
            . "🌐 *Gerenciar seu site*\n"
            . "• \"Publicar meu site\"\n"
            . "• \"Atualizar título para [novo título]\"\n\n"
            . "Pode falar em texto ou enviar um *áudio*! 🎙️";
    }

    private function publicarSite(Cliente $cliente): string
    {
        return "🚀 Publicação de site ainda não implementada nesta versão.\n"
            . "Em breve você poderá publicar diretamente por aqui!";
    }

    private function acaoPendente(string $acao): string
    {
        return "⚙️ A ação *{$acao}* ainda está sendo implementada.\n"
            . "Digite *ajuda* para ver o que já está disponível.";
    }
}
