<?php

namespace App\Http\Middleware;

use App\Modules\Core\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutenticarAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof Admin) {
            return response()->json(['mensagem' => 'Acesso negado.'], 403);
        }

        return $next($request);
    }
}
