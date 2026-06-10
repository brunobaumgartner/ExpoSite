<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\DTOs\DadosCadastro;
use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\Plano;
use Illuminate\Support\Str;

class GerenciadorCadastro
{
    public function __construct(
        private readonly GatewayMercadoPago $gateway
    ) {}

    public function slugDisponivel(string $slug): bool
    {
        return !Cliente::where('slug', $slug)->exists();
    }

    public function sugerirSlugs(string $slug): array
    {
        $sugestoes = [];

        for ($i = 1; $i <= 3; $i++) {
            $candidato = "{$slug}-{$i}";
            if ($this->slugDisponivel($candidato)) {
                $sugestoes[] = $candidato;
            }
        }

        return $sugestoes;
    }

    public function iniciar(DadosCadastro $dados): array
    {
        abort_if(!$this->slugDisponivel($dados->slug), 422, 'Slug indisponível.');

        $plano = Plano::findOrFail($dados->planoId);
        $referencia = Str::random(64);

        $cadastro = CadastroPendente::create([
            'plano_id'             => $dados->planoId,
            'slug'                 => $dados->slug,
            'email'                => $dados->email,
            'tipo_site'            => $dados->tipoSite,
            'dados'                => [
                'nome_negocio' => $dados->nomeNegocio,
                'ciclo'        => $dados->ciclo,
                'nome'         => $dados->nome,
                'telefone'     => $dados->telefone,
                'senha'        => bcrypt($dados->senha),
            ],
            'referencia_pagamento' => $referencia,
            'status'               => 'aguardando_pagamento',
        ]);

        $preferencia = $this->gateway->criarPreferencia(
            plano:      $plano,
            ciclo:      $dados->ciclo,
            email:      $dados->email,
            referencia: $referencia,
        );

        return [
            'referencia'   => $referencia,
            'checkout_url' => $preferencia['init_point'],
        ];
    }
}
