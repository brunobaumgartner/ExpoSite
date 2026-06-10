<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\DTOs\DadosCadastro;
use App\Modules\Core\Services\GerenciadorCadastro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControladorCadastro extends Controller
{
    public function __construct(
        private readonly GerenciadorCadastro $gerenciador
    ) {}

    public function verificarSlug(string $slug): JsonResponse
    {
        $disponivel = $this->gerenciador->slugDisponivel($slug);

        return response()->json([
            'slug'       => $slug,
            'disponivel' => $disponivel,
            'sugestoes'  => $disponivel ? [] : $this->gerenciador->sugerirSlugs($slug),
        ]);
    }

    public function iniciar(Request $request): JsonResponse
    {
        $request->validate([
            'nome_negocio' => 'required|string|max:150',
            'slug'         => 'required|string|max:100|regex:/^[a-z0-9-]+$/',
            'tipo_site'    => 'required|in:landing-page,institucional,ecommerce,cardapio,agendamento',
            'plano_id'     => 'required|exists:planos,id',
            'ciclo'        => 'required|in:mensal,anual',
            'nome'         => 'required|string|max:150',
            'email'        => 'required|email|unique:clientes,email',
            'telefone'     => 'required|string|max:30',
            'senha'        => 'required|string|min:8|confirmed',
        ]);

        $dados = DadosCadastro::deRequest($request);
        $resultado = $this->gerenciador->iniciar($dados);

        return response()->json($resultado, 201);
    }
}
