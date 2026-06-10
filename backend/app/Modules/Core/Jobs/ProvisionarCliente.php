<?php

namespace App\Modules\Core\Jobs;

use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Services\GerenciadorCliente;
use App\Modules\Core\Services\GerenciadorEmail;
use App\Modules\Core\Services\GerenciadorPoolBots;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProvisionarCliente implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private readonly int    $cadastroId,
        private readonly string $pagamentoId,
    ) {}

    public function handle(
        GerenciadorCliente  $gerenciadorCliente,
        GerenciadorPoolBots $gerenciadorBots,
        GerenciadorEmail    $gerenciadorEmail,
    ): void {
        $cadastro    = CadastroPendente::with('plano')->findOrFail($this->cadastroId);
        $dadosExtras = $cadastro->dados;

        DB::transaction(function () use ($cadastro, $dadosExtras, $gerenciadorCliente, $gerenciadorBots, $gerenciadorEmail) {
            $cliente = Cliente::create([
                'slug'       => $cadastro->slug,
                'email'      => $cadastro->email,
                'subdominio' => $cadastro->slug . '.' . env('APP_DOMAIN', 'exposite.com.br'),
                'plano_id'   => $cadastro->plano_id,
                'status'     => 'ativo',
            ]);

            $modulos = $gerenciadorCliente->modulosPorTipo($cadastro->tipo_site);
            $gerenciadorCliente->provisionar($cliente, $modulos);

            $gerenciadorCliente->criarUsuarioAdmin($cliente, [
                'nome'     => $dadosExtras['nome'],
                'email'    => $cadastro->email,
                'senha'    => $dadosExtras['senha'],
                'telefone' => $dadosExtras['telefone'],
            ]);

            $bot = $gerenciadorBots->atribuir($cliente);

            $ciclo = $dadosExtras['ciclo'];
            $valor = $ciclo === 'anual'
                ? $cadastro->plano->preco_anual
                : $cadastro->plano->preco_mensal;

            Fatura::create([
                'cliente_id'         => $cliente->id,
                'referencia_externa' => $this->pagamentoId,
                'valor'              => $valor,
                'status'             => 'pago',
                'pago_em'            => now(),
                'vence_em'           => $ciclo === 'anual' ? now()->addYear() : now()->addMonth(),
            ]);

            $gerenciadorEmail->enviarBoasVindas(
                $cliente,
                $cadastro->email,
                $bot->linkTelegram(),
            );

            $cadastro->update(['status' => 'concluido']);
        });
    }

    public function failed(\Throwable $exception): void
    {
        CadastroPendente::where('id', $this->cadastroId)
            ->update(['status' => 'falhou']);
    }
}
