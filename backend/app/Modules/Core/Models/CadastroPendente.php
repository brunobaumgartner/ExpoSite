<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CadastroPendente extends Model
{
    protected $table = 'cadastros_pendentes';

    protected $fillable = [
        'plano_id',
        'slug',
        'email',
        'tipo_site',
        'dados',
        'referencia_pagamento',
        'status',
    ];

    protected $casts = [
        'dados' => 'array',
    ];

    public function plano(): BelongsTo
    {
        return $this->belongsTo(Plano::class);
    }
}
