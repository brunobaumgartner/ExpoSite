<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\DTOs\DadosCadastro;
use App\Modules\Core\Services\GerenciadorCadastro;
use App\Modules\Core\Services\GerenciadorEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ControladorCadastro extends Controller
{
    public function __construct(
        private readonly GerenciadorCadastro $gerenciador,
        private readonly GerenciadorEmail    $gerenciadorEmail,
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

    public function preRegistrar(Request $request): JsonResponse
    {
        $request->validate([
            'nome'          => 'required|string|max:150',
            'nome_empresa'  => 'required|string|max:200',
            'email'         => 'required|email|unique:pre_registros,email',
            'telefone'      => 'required|string|max:30',
            'cpf'           => 'required|string|max:14|unique:pre_registros,cpf',
            'tipo_site'     => 'required|in:landing-page,institucional,ecommerce,cardapio,agendamento',
            'slug_desejado' => 'required|string|max:100|regex:/^[a-z0-9-]+$/',
            'senha'         => 'required|string|min:8|confirmed',
        ]);

        $registro = $this->gerenciador->preRegistrar($request->all());

        $link = config('app.url') . '/api/cadastro/confirmar/' . $registro->token;

        $this->gerenciadorEmail->enviarConfirmacaoCadastro($registro, $link);

        return response()->json([
            'mensagem' => 'Cadastro recebido! Verifique seu e-mail para confirmar.',
        ], 201);
    }

    public function confirmarEmail(string $token): RedirectResponse
    {
        $this->gerenciador->confirmarEmail($token);

        return redirect('/cadastro/confirmado/');
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
