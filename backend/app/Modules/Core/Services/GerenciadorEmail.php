<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Cliente;
use Illuminate\Support\Facades\Mail;

class GerenciadorEmail
{
    public function enviarBoasVindas(Cliente $cliente, string $email, string $linkTelegram): void
    {
        Mail::send('emails.boas-vindas', [
            'cliente'       => $cliente,
            'link_telegram' => $linkTelegram,
            'link_painel'   => config('app.url') . '/painel',
        ], function ($mensagem) use ($email) {
            $mensagem->to($email)
                     ->subject('Bem-vindo ao ExpoSite! Seu site está pronto para ser criado.');
        });
    }

    public function enviarAvisoVencimento(Cliente $cliente, string $email): void
    {
        Mail::send('emails.aviso-vencimento', [
            'cliente' => $cliente,
        ], function ($mensagem) use ($email) {
            $mensagem->to($email)
                     ->subject('Seu plano ExpoSite vence em 3 dias — renove para não perder o acesso.');
        });
    }

    public function enviarAvisoSuspensao(Cliente $cliente, string $email): void
    {
        Mail::send('emails.suspensao', [
            'cliente' => $cliente,
        ], function ($mensagem) use ($email) {
            $mensagem->to($email)
                     ->subject('Seu site ExpoSite foi suspenso — reative agora.');
        });
    }
}
