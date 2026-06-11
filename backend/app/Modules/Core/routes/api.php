<?php

use App\Http\Middleware\AutenticacaoInterna;
use App\Modules\Core\Controllers\ControladorAgente;
use App\Modules\Core\Controllers\ControladorCadastro;
use App\Modules\Core\Controllers\ControladorWebhook;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {

    Route::prefix('cadastro')->group(function () {
        Route::get('verificar-slug/{slug}', [ControladorCadastro::class, 'verificarSlug']);
        Route::post('pre-registro', [ControladorCadastro::class, 'preRegistrar']);
        Route::get('confirmar/{token}', [ControladorCadastro::class, 'confirmarEmail']);
        Route::post('iniciar', [ControladorCadastro::class, 'iniciar']);
    });

    Route::post('webhooks/mercadopago', [ControladorWebhook::class, 'mercadoPago']);

    Route::prefix('interno')->middleware(AutenticacaoInterna::class)->group(function () {
        Route::get('clientes/por-chat/{chatId}', [ControladorAgente::class, 'clientePorChat']);
        Route::get('pre-registros/por-email/{email}', [ControladorAgente::class, 'preRegistroPorEmail']);
        Route::post('pre-registros/{preRegistroId}/ativar', [ControladorAgente::class, 'ativarCliente']);
        Route::post('clientes/{clienteId}/acoes', [ControladorAgente::class, 'executarAcao']);
    });

});
