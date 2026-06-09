<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutenticarPainel
{
    /**
     * Garante que o usuário está autenticado no painel do cliente.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json(['mensagem' => 'Não autenticado.'], 401);
        }

        return $next($request);
    }
}
