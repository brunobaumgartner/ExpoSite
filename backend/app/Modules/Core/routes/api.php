<?php

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

});
