<?php

namespace App\Console\Commands;

use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Services\GerenciadorEmail;
use Illuminate\Console\Command;

class SuspenderClienteVencido extends Command
{
    protected $signature   = 'clientes:suspender-vencidos';
    protected $description = 'Suspende clientes com fatura vencida sem renovação.';

    public function handle(GerenciadorEmail $gerenciadorEmail): void
    {
        $faturasVencidas = Fatura::where('status', 'pago')
            ->where('vence_em', '<', now())
            ->with('cliente')
            ->get();

        foreach ($faturasVencidas as $fatura) {
            $cliente = $fatura->cliente;

            if (!$cliente || !$cliente->estaAtivo()) {
                continue;
            }

            $cliente->update([
                'status'     => 'suspenso',
                'suspenso_em' => now(),
            ]);

            $gerenciadorEmail->enviarAvisoSuspensao(
                $cliente,
                $this->buscarEmailAdmin($cliente),
            );

            $this->info("Cliente {$cliente->slug} suspenso.");
        }
    }

    private function buscarEmailAdmin(mixed $cliente): string
    {
        return \Illuminate\Support\Facades\DB::connection('cliente')
            ->table('usuarios')
            ->where('perfil', 'admin')
            ->value('email') ?? '';
    }
}
