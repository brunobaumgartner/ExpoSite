<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Core\Models\Admin;
use App\Modules\Core\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class ControladorAuthAdmin extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->senha, $admin->senha)) {
            return response()->json(['mensagem' => 'Credenciais inválidas.'], 401);
        }

        $admin->tokens()->where('name', 'admin')->delete();
        $token = $admin->createToken('admin')->plainTextToken;

        return response()->json(['token' => $token, 'nome' => $admin->nome]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['mensagem' => 'Sessão encerrada.']);
    }

    public function eu(Request $request): JsonResponse
    {
        return response()->json(['nome' => $request->user()->nome, 'email' => $request->user()->email]);
    }

    public function impersonar(int $clienteId): JsonResponse
    {
        $cliente = Cliente::findOrFail($clienteId);

        $cliente->tokens()->where('name', 'impersonacao')->delete();

        $token = $cliente->createToken('impersonacao', ['*'], now()->addMinutes(30))->plainTextToken;

        return response()->json(['token' => $token, 'slug' => $cliente->slug]);
    }
}
