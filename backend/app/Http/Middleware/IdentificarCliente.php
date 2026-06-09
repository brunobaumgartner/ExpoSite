<?php

namespace App\Http\Middleware;

use App\Modules\Core\Services\GerenciadorCliente;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentificarCliente
{
    public function __construct(
        private readonly GerenciadorCliente $gerenciador
    ) {}

    /**
     * Identifica o cliente pelo subdomínio e configura a conexão antes de qualquer ação.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $subdominio = $this->extrairSubdominio($request->getHost());

        $cliente = $this->gerenciador->buscarPorSubdominio($subdominio);

        if (!$cliente) {
            abort(404, 'Cliente não encontrado.');
        }

        if (!$cliente->estaAtivo()) {
            abort(403, 'Esta conta está suspensa.');
        }

        $this->gerenciador->configurarConexao($cliente);

        $request->merge(['cliente' => $cliente]);

        return $next($request);
    }

    /**
     * Extrai o subdomínio a partir do host completo.
     * Ex: "barbearia-joao.exposite.com.br" → "barbearia-joao"
     */
    private function extrairSubdominio(string $host): string
    {
        return explode('.', $host)[0];
    }
}
