<?php

namespace App\Modules\Painel\Controllers;

use App\Modules\Core\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class ControladorAuth extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string',
        ]);

        $cliente = Cliente::where('email', $request->email)->first();

        if (!$cliente || !Hash::check($request->senha, $cliente->password)) {
            return response()->json(['mensagem' => 'E-mail ou senha inválidos.'], 401);
        }

        if (!$cliente->estaAtivo()) {
            return response()->json(['mensagem' => 'Conta suspensa. Entre em contato com o suporte.'], 403);
        }

        $cliente->tokens()->where('name', 'painel')->delete();
        $token = $cliente->createToken('painel')->plainTextToken;

        return response()->json([
            'token'        => $token,
            'nome_empresa' => $cliente->nome_empresa,
            'slug'         => $cliente->slug,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['mensagem' => 'Sessão encerrada.']);
    }

    public function eu(Request $request): JsonResponse
    {
        $cliente = $request->user()->load('plano');

        return response()->json([
            'nome'          => $cliente->nome,
            'nome_empresa'  => $cliente->nome_empresa,
            'email'         => $cliente->email,
            'slug'          => $cliente->slug,
            'tipo_site'     => $cliente->tipo_site,
            'subdominio'    => $cliente->subdominio,
            'plano'         => $cliente->plano?->nome,
        ]);
    }
}
