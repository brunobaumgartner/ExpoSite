<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Jobs\ProvisionarCliente;
use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Services\GatewayMercadoPago;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ControladorWebhook extends Controller
{
    public function __construct(
        private readonly GatewayMercadoPago $gateway
    ) {}

    public function mercadoPago(Request $request): Response
    {
        $assinatura = $request->header('x-signature', '');
        $payload    = $request->getContent();

        if (!$this->gateway->validarWebhook($assinatura, $payload)) {
            return response('Assinatura inválida.', 401);
        }

        $tipo  = $request->input('type');
        $dados = $request->input('data', []);

        if ($tipo === 'payment' && isset($dados['id'])) {
            $this->processarPagamento((string) $dados['id']);
        }

        return response('OK', 200);
    }

    private function processarPagamento(string $pagamentoId): void
    {
        $pagamento = $this->gateway->buscarPagamento($pagamentoId);

        if ($pagamento['status'] !== 'approved') {
            return;
        }

        $cadastro = CadastroPendente::where('referencia_pagamento', $pagamento['external_reference'])
            ->where('status', 'aguardando_pagamento')
            ->first();

        if (!$cadastro) {
            return;
        }

        $cadastro->update(['status' => 'provisionando']);

        ProvisionarCliente::dispatch($cadastro->id, $pagamentoId);
    }
}
