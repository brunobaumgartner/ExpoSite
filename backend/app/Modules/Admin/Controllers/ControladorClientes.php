<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\LogAtividade;
use App\Modules\Core\Models\Visualizacao;
use App\Modules\Core\Services\GerenciadorCliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class ControladorClientes extends Controller
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciadorCliente,
    ) {}

    public function listar(Request $request): JsonResponse
    {
        $query = Cliente::with('plano')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->busca, fn($q, $b) => $q->where(function ($q) use ($b) {
                $q->where('nome_empresa', 'like', "%{$b}%")
                  ->orWhere('email', 'like', "%{$b}%")
                  ->orWhere('slug', 'like', "%{$b}%");
            }))
            ->orderByDesc('created_at');

        $clientes = $query->paginate(20)->through(fn($c) => [
            'id'                   => $c->id,
            'nome_empresa'         => $c->nome_empresa,
            'slug'                 => $c->slug,
            'email'                => $c->email,
            'status'               => $c->status,
            'tipo_site'            => $c->tipo_site,
            'plano'                => $c->plano?->nome,
            'mensagens_usadas_mes' => $c->mensagens_usadas_mes,
            'tokens_usados_mes'    => $c->tokens_usados_mes,
            'created_at'           => $c->created_at,
        ]);

        return response()->json($clientes);
    }

    public function detalhe(int $id): JsonResponse
    {
        $cliente = Cliente::with('plano')->findOrFail($id);
        $this->gerenciadorCliente->configurarConexao($cliente);

        $logs = LogAtividade::orderByDesc('created_at')->limit(50)->get();

        $tamanhoBanco = DB::select(
            "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS mb
             FROM information_schema.TABLES
             WHERE table_schema = ?",
            [$cliente->nomeSchema()]
        )[0]->mb ?? 0;

        $visualizacoesMes = Visualizacao::where('cliente_id', $id)
            ->whereMonth('created_at', now()->month)
            ->count();

        $visualizacoes7d = Visualizacao::where('cliente_id', $id)
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        $topPaginas = Visualizacao::where('cliente_id', $id)
            ->selectRaw('caminho, COUNT(*) as total')
            ->groupBy('caminho')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json([
            'cliente' => [
                'id'                   => $cliente->id,
                'nome'                 => $cliente->nome,
                'nome_empresa'         => $cliente->nome_empresa,
                'slug'                 => $cliente->slug,
                'email'                => $cliente->email,
                'status'               => $cliente->status,
                'tipo_site'            => $cliente->tipo_site,
                'subdominio'           => $cliente->subdominio,
                'plano'                => $cliente->plano?->nome,
                'mensagens_usadas_mes' => $cliente->mensagens_usadas_mes,
                'tokens_usados_mes'    => $cliente->tokens_usados_mes,
                'created_at'           => $cliente->created_at,
            ],
            'banco_mb'          => (float) $tamanhoBanco,
            'logs'              => $logs,
            'analytics' => [
                'visualizacoes_mes' => $visualizacoesMes,
                'por_dia'           => $visualizacoes7d,
                'top_paginas'       => $topPaginas,
            ],
        ]);
    }

    public function suspender(int $id): JsonResponse
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->update(['status' => 'suspenso', 'suspenso_em' => now()]);

        return response()->json(['mensagem' => "Cliente {$cliente->nome_empresa} suspenso."]);
    }

    public function reativar(int $id): JsonResponse
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->update(['status' => 'ativo', 'suspenso_em' => null]);

        return response()->json(['mensagem' => "Cliente {$cliente->nome_empresa} reativado."]);
    }
}
