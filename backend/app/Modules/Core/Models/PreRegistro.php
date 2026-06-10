<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;

class PreRegistro extends Model
{
    protected $table = 'pre_registros';

    protected $fillable = [
        'nome',
        'nome_empresa',
        'email',
        'telefone',
        'cpf',
        'tipo_site',
        'slug_desejado',
        'senha',
        'dados',
        'token',
        'status',
        'confirmado_em',
    ];

    protected $hidden = ['senha', 'token'];

    protected $casts = [
        'dados'         => 'array',
        'confirmado_em' => 'datetime',
    ];
}
