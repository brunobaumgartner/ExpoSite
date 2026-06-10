<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Plano;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

class GatewayMercadoPago
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
    }

    public function criarPreferencia(Plano $plano, string $ciclo, string $email, string $referencia): array
    {
        $valor = $ciclo === 'anual' ? $plano->preco_anual : $plano->preco_mensal;

        $client = new PreferenceClient();

        $preferencia = $client->create([
            'items' => [[
                'title'       => "ExpoSite — Plano {$plano->nome} ({$ciclo})",
                'quantity'    => 1,
                'unit_price'  => (float) $valor,
                'currency_id' => 'BRL',
            ]],
            'payer' => [
                'email' => $email,
            ],
            'back_urls' => [
                'success' => config('app.url') . "/cadastro/sucesso?ref={$referencia}",
                'failure' => config('app.url') . "/cadastro/falha?ref={$referencia}",
                'pending' => config('app.url') . "/cadastro/pendente?ref={$referencia}",
            ],
            'notification_url' => config('app.url') . '/api/webhooks/mercadopago',
            'external_reference' => $referencia,
            'auto_return' => 'approved',
        ]);

        return [
            'id'         => $preferencia->id,
            'init_point' => $preferencia->init_point,
        ];
    }

    public function buscarPagamento(string $pagamentoId): array
    {
        $client = new PaymentClient();
        $pagamento = $client->get((int) $pagamentoId);

        return [
            'id'                 => $pagamento->id,
            'status'             => $pagamento->status,
            'external_reference' => $pagamento->external_reference,
            'valor'              => $pagamento->transaction_amount,
        ];
    }

    public function validarWebhook(string $assinatura, string $payload): bool
    {
        $segredo = config('services.mercadopago.webhook_secret');
        $esperado = hash_hmac('sha256', $payload, $segredo);

        return hash_equals($esperado, $assinatura);
    }
}
