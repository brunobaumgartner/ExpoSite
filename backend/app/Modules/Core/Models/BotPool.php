<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotPool extends Model
{
    protected $table = 'bot_pool';

    protected $fillable = [
        'token',
        'username',
        'status',
        'cliente_id',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function linkTelegram(): string
    {
        return "https://t.me/{$this->username}";
    }
}
