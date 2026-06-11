<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Services\GerenciadorAgente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorAgente extends Controller
{
    public function __construct(
        private readonly GerenciadorAgente $gerenciador,
    ) {}

    public function clientePorChat(string $chatId): JsonResponse
    {
        $cliente = $this->gerenciador->buscarClientePorChat($chatId);

        if (!$cliente) {
            return response()->json(['mensagem' => 'Não encontrado.'], 404);
        }

        return response()->json($cliente);
    }

    public function preRegistroPorEmail(string $email): JsonResponse
    {
        $registro = $this->gerenciador->buscarPreRegistroPorEmail($email);

        if (!$registro) {
            return response()->json(['mensagem' => 'Não encontrado.'], 404);
        }

        return response()->json($registro);
    }

    public function ativarCliente(Request $request, int $preRegistroId): JsonResponse
    {
        $dados = $request->validate([
            'chat_id' => 'required|string|max:50',
        ]);

        $resultado = $this->gerenciador->ativarCliente($preRegistroId, $dados['chat_id']);

        return response()->json($resultado, 201);
    }

    public function executarAcao(Request $request, int $clienteId): JsonResponse
    {
        $dados = $request->validate([
            'acao'       => 'required|string|max:100',
            'parametros' => 'sometimes|array',
        ]);

        $mensagem = $this->gerenciador->executarAcao(
            acao:       $dados['acao'],
            parametros: $dados['parametros'] ?? [],
            clienteId:  $clienteId,
        );

        return response()->json(['mensagem' => $mensagem]);
    }
}
