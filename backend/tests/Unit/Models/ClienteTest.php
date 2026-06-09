<?php

namespace Tests\Unit\Models;

use App\Modules\Core\Models\Cliente;
use PHPUnit\Framework\TestCase;

class ClienteTest extends TestCase
{
    public function test_cliente_ativo_retorna_verdadeiro(): void
    {
        $cliente = new Cliente(['status' => 'ativo']);

        $this->assertTrue($cliente->estaAtivo());
    }

    public function test_cliente_suspenso_retorna_falso(): void
    {
        $cliente = new Cliente(['status' => 'suspenso']);

        $this->assertFalse($cliente->estaAtivo());
    }

    public function test_cliente_cancelado_retorna_falso(): void
    {
        $cliente = new Cliente(['status' => 'cancelado']);

        $this->assertFalse($cliente->estaAtivo());
    }

    public function test_nome_schema_formata_corretamente(): void
    {
        $cliente = new Cliente(['slug' => 'barbearia-joao']);

        $this->assertSame('cliente_barbearia-joao', $cliente->nomeSchema());
    }
}
