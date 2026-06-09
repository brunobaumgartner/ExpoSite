<?php

namespace Tests\Unit\Services;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Services\GerenciadorCliente;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GerenciadorClienteTest extends TestCase
{
    private GerenciadorCliente $gerenciador;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gerenciador = new GerenciadorCliente();
    }

    public function test_configurar_conexao_atualiza_database_do_cliente(): void
    {
        $cliente = new Cliente(['slug' => 'barbearia-joao']);

        DB::shouldReceive('purge')->once()->with('cliente');
        DB::shouldReceive('reconnect')->once()->with('cliente');

        $this->gerenciador->configurarConexao($cliente);

        $this->assertSame(
            'cliente_barbearia-joao',
            config('database.connections.cliente.database')
        );
    }
}
