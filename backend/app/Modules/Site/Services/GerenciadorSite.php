<?php

namespace App\Modules\Site\Services;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Services\GerenciadorCliente;
use App\Modules\Site\Jobs\ReconstruirSite;
use App\Modules\Site\Models\SiteConfig;
use App\Modules\Site\Models\SiteVersao;

class GerenciadorSite
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciadorCliente,
    ) {}

    public function atualizar(Cliente $cliente, array $campos, string $mensagem = 'Atualização via agente'): string
    {
        $this->gerenciadorCliente->configurarConexao($cliente);

        foreach ($campos as $chave => $valor) {
            $valorSerializado = is_array($valor) ? json_encode($valor, JSON_UNESCAPED_UNICODE) : (string) $valor;

            SiteConfig::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valorSerializado],
            );
        }

        $snapshot = SiteConfig::all()->mapWithKeys(fn($r) => [$r->chave => $r->valor])->toArray();

        SiteVersao::create([
            'snapshot' => $snapshot,
            'mensagem' => $mensagem,
            'status'   => 'pendente',
        ]);

        ReconstruirSite::dispatch($cliente->id);

        return "✅ *{$cliente->nome_empresa}* atualizado! O site será publicado em instantes em *{$cliente->slug}.exposite.com.br*.";
    }

    public function listarVersoes(Cliente $cliente, int $limite = 5): string
    {
        $this->gerenciadorCliente->configurarConexao($cliente);

        $versoes = SiteVersao::latest()->limit($limite)->get(['id', 'mensagem', 'status', 'created_at']);

        if ($versoes->isEmpty()) {
            return '📋 Nenhuma versão publicada ainda.';
        }

        $linhas = $versoes->map(fn($v) => "• `v{$v->id}` — {$v->mensagem} ({$v->status}) em {$v->created_at->format('d/m H:i')}");

        return "📋 *Versões do site:*\n\n" . $linhas->implode("\n");
    }

    public function rollback(Cliente $cliente, int $versaoId): string
    {
        $this->gerenciadorCliente->configurarConexao($cliente);

        $versao = SiteVersao::findOrFail($versaoId);

        foreach ($versao->snapshot as $chave => $valor) {
            SiteConfig::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valor],
            );
        }

        SiteVersao::create([
            'snapshot' => $versao->snapshot,
            'mensagem' => "Rollback para v{$versaoId}",
            'status'   => 'pendente',
        ]);

        ReconstruirSite::dispatch($cliente->id);

        return "⏪ Site restaurado para a versão *v{$versaoId}*. Publicando em instantes.";
    }

    public function obterConfig(Cliente $cliente): array
    {
        $this->gerenciadorCliente->configurarConexao($cliente);

        return SiteConfig::all()->mapWithKeys(fn($r) => [$r->chave => $r->valor])->toArray();
    }
}
