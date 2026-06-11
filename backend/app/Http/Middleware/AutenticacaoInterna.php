<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutenticacaoInterna
{
    public function handle(Request $request, Closure $next): Response
    {
        $tokenEsperado = config('app.api_token_interno');

        if (!$tokenEsperado || $request->bearerToken() !== $tokenEsperado) {
            return response()->json(['mensagem' => 'Acesso negado.'], 401);
        }

        return $next($request);
    }
}
