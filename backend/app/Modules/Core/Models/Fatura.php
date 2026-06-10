<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fatura extends Model
{
    protected $table = 'faturas';

    protected $fillable = [
        'cliente_id',
        'referencia_externa',
        'valor',
        'status',
        'pago_em',
        'vence_em',
    ];

    protected $casts = [
        'pago_em'  => 'datetime',
        'vence_em' => 'datetime',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
}
