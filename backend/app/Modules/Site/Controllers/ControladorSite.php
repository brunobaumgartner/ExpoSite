<?php

namespace App\Modules\Site\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\Cliente;
use App\Modules\Site\Services\GerenciadorSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorSite extends Controller
{
    public function __construct(
        private readonly GerenciadorSite $gerenciador,
    ) {}

    public function atualizar(Request $request, int $clienteId): JsonResponse
    {
        $dados = $request->validate([
            'campos'   => 'required|array',
            'mensagem' => 'sometimes|string|max:255',
        ]);

        $cliente  = Cliente::findOrFail($clienteId);
        $resposta = $this->gerenciador->atualizar(
            $cliente,
            $dados['campos'],
            $dados['mensagem'] ?? 'Atualização via agente',
        );

        return response()->json(['mensagem' => $resposta]);
    }

    public function versoes(int $clienteId): JsonResponse
    {
        $cliente  = Cliente::findOrFail($clienteId);
        $resposta = $this->gerenciador->listarVersoes($cliente);

        return response()->json(['mensagem' => $resposta]);
    }

    public function rollback(Request $request, int $clienteId): JsonResponse
    {
        $dados    = $request->validate(['versao_id' => 'required|integer']);
        $cliente  = Cliente::findOrFail($clienteId);
        $resposta = $this->gerenciador->rollback($cliente, $dados['versao_id']);

        return response()->json(['mensagem' => $resposta]);
    }
}
