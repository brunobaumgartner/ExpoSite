<?php

namespace Tests\Feature\Middleware;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Services\GerenciadorCliente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentificarClienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_requisicao_sem_cliente_retorna_404(): void
    {
        $this->mock(GerenciadorCliente::class, function ($mock) {
            $mock->shouldReceive('buscarPorSubdominio')->andReturn(null);
        });

        $resposta = $this->withServerVariables(['HTTP_HOST' => 'inexistente.exposite.com.br'])
                         ->get('/api/ping');

        $resposta->assertStatus(404);
    }

    public function test_requisicao_com_cliente_suspenso_retorna_403(): void
    {
        $cliente = new Cliente(['status' => 'suspenso', 'slug' => 'teste']);

        $this->mock(GerenciadorCliente::class, function ($mock) use ($cliente) {
            $mock->shouldReceive('buscarPorSubdominio')->andReturn($cliente);
            $mock->shouldReceive('configurarConexao')->never();
        });

        $resposta = $this->withServerVariables(['HTTP_HOST' => 'teste.exposite.com.br'])
                         ->get('/api/ping');

        $resposta->assertStatus(403);
    }
}
