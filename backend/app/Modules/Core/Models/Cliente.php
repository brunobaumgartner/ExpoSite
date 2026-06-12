<?php

namespace App\Modules\Core\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Cliente extends Model implements AuthenticatableContract
{
    use SoftDeletes, Authenticatable, HasApiTokens;

    protected $table = 'clientes';

    protected $fillable = [
        'slug',
        'email',
        'password',
        'nome',
        'nome_empresa',
        'tipo_site',
        'telegram_chat_id',
        'mensagens_usadas_mes',
        'subdominio',
        'plano_id',
        'status',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'suspenso_em'          => 'datetime',
        'cancela_em'           => 'datetime',
        'deleted_at'           => 'datetime',
        'mensagens_usadas_mes' => 'integer',
    ];

    public function plano(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Modules\Core\Models\Plano::class);
    }

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
