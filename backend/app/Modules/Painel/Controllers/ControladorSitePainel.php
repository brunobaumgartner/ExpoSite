<?php

namespace App\Modules\Painel\Controllers;

use App\Modules\Core\Services\GerenciadorCliente;
use App\Modules\Site\Models\SiteConfig;
use App\Modules\Site\Models\SiteVersao;
use App\Modules\Site\Services\GerenciadorSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ControladorSitePainel extends Controller
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciadorCliente,
        private readonly GerenciadorSite    $gerenciadorSite,
    ) {}

    public function visao(Request $request): JsonResponse
    {
        $cliente = $request->user();
        $this->gerenciadorCliente->configurarConexao($cliente);

        $configs  = SiteConfig::all()->mapWithKeys(fn($r) => [$r->chave => $r->valor]);
        $versoes  = SiteVersao::latest()->take(10)->get(['id', 'mensagem', 'status', 'publicado_em', 'created_at']);

        return response()->json([
            'configs' => $configs,
            'versoes' => $versoes,
            'url'     => "https://{$cliente->subdominio}",
        ]);
    }

    public function rollback(Request $request, int $versaoId): JsonResponse
    {
        $resposta = $this->gerenciadorSite->rollback($request->user(), $versaoId);

        return response()->json(['mensagem' => $resposta]);
    }
}
