<?php

namespace App\Modules\Core\DTOs;

use Illuminate\Http\Request;

class DadosCadastro
{
    public function __construct(
        public readonly string $nomeNegocio,
        public readonly string $slug,
        public readonly string $tipoSite,
        public readonly int    $planoId,
        public readonly string $ciclo,
        public readonly string $nome,
        public readonly string $email,
        public readonly string $telefone,
        public readonly string $senha,
    ) {}

    public static function deRequest(Request $request): self
    {
        return new self(
            nomeNegocio: $request->input('nome_negocio'),
            slug:        $request->input('slug'),
            tipoSite:    $request->input('tipo_site'),
            planoId:     (int) $request->input('plano_id'),
            ciclo:       $request->input('ciclo'),
            nome:        $request->input('nome'),
            email:       $request->input('email'),
            telefone:    $request->input('telefone'),
            senha:       $request->input('senha'),
        );
    }
}
