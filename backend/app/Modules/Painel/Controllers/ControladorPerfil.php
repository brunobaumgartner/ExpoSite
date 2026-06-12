<?php

namespace App\Modules\Painel\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class ControladorPerfil extends Controller
{
    public function alterarSenha(Request $request): JsonResponse
    {
        $request->validate([
            'senha_atual' => 'required|string',
            'nova_senha'  => 'required|string|min:8|confirmed',
        ]);

        $cliente = $request->user();

        if (!Hash::check($request->senha_atual, $cliente->password)) {
            return response()->json(['mensagem' => 'Senha atual incorreta.'], 422);
        }

        $cliente->update(['password' => Hash::make($request->nova_senha)]);
        $cliente->tokens()->where('name', 'painel')->delete();

        return response()->json(['mensagem' => 'Senha alterada. Faça login novamente.']);
    }
}
