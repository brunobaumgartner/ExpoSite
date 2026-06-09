<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutenticarAdmin
{
    /**
     * Garante que o usuário é um administrador da plataforma.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->eAdmin()) {
            return response()->json(['mensagem' => 'Acesso negado.'], 403);
        }

        return $next($request);
    }
}
