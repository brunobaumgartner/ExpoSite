<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

    protected $table = 'clientes';

    protected $fillable = [
        'slug',
        'email',
        'subdominio',
        'plano_id',
        'status',
    ];

    protected $casts = [
        'suspenso_em' => 'datetime',
        'cancela_em'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];

    /**
     * Verifica se o cliente está ativo e pode usar a plataforma.
     */
    public function estaAtivo(): bool
    {
        return $this->status === 'ativo';
    }

    /**
     * Retorna o nome do schema MySQL deste cliente.
     */
    public function nomeSchema(): string
    {
        return "cliente_{$this->slug}";
    }
}
