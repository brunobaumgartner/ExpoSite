<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plano extends Model
{
    protected $table = 'planos';

    protected $fillable = [
        'nome',
        'modulos',
        'limite_mensagens',
        'limite_produtos',
        'limite_agendamentos',
        'preco_mensal',
        'preco_anual',
        'ativo',
    ];

    protected $casts = [
        'modulos' => 'array',
        'ativo'   => 'boolean',
    ];

    public function clientes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Cliente::class);
    }
}
