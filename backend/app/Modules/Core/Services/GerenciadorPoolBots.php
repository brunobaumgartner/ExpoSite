<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\BotPool;
use App\Modules\Core\Models\Cliente;
use Illuminate\Support\Facades\DB;

class GerenciadorPoolBots
{
    /**
     * Lock pessimista garante que dois provisionamentos simultâneos
     * nunca atribuam o mesmo bot a clientes diferentes.
     */
    public function atribuir(Cliente $cliente): BotPool
    {
        return DB::transaction(function () use ($cliente) {
            $bot = BotPool::where('status', 'disponivel')
                ->lockForUpdate()
                ->firstOrFail();

            $bot->update([
                'status'     => 'em_uso',
                'cliente_id' => $cliente->id,
            ]);

            return $bot;
        });
    }

    public function quantidadeDisponivel(): int
    {
        return BotPool::where('status', 'disponivel')->count();
    }

    public function poolBaixo(): bool
    {
        return $this->quantidadeDisponivel() < 10;
    }
}
