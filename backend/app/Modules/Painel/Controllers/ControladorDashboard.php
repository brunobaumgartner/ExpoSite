<?php

namespace App\Modules\Painel\Controllers;

use App\Modules\Core\Services\GerenciadorCliente;
use App\Modules\Site\Models\SiteVersao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ControladorDashboard extends Controller
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciadorCliente,
    ) {}

    public function informacoes(Request $request): JsonResponse
    {
        $cliente = $request->user()->load('plano');
        $plano   = $cliente->plano;

        $this->gerenciadorCliente->configurarConexao($cliente);

        $ultimaVersao = SiteVersao::latest()->first();

        return response()->json([
            'cliente' => [
                'nome'                 => $cliente->nome,
                'nome_empresa'         => $cliente->nome_empresa,
                'slug'                 => $cliente->slug,
                'subdominio'           => $cliente->subdominio,
                'tipo_site'            => $cliente->tipo_site,
                'mensagens_usadas_mes' => $cliente->mensagens_usadas_mes,
            ],
            'plano' => $plano ? [
                'nome'             => $plano->nome,
                'limite_mensagens' => $plano->limite_mensagens,
            ] : null,
            'site' => [
                'status'       => $ultimaVersao?->status ?? 'sem_versao',
                'publicado_em' => $ultimaVersao?->publicado_em,
                'url'          => "https://{$cliente->subdominio}",
            ],
        ]);
    }
}
