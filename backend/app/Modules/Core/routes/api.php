<?php

use App\Modules\Core\Controllers\ControladorCadastro;
use App\Modules\Core\Controllers\ControladorWebhook;
use Illuminate\Support\Facades\Route;

Route::prefix('cadastro')->group(function () {
    Route::get('verificar-slug/{slug}', [ControladorCadastro::class, 'verificarSlug']);
    Route::post('iniciar', [ControladorCadastro::class, 'iniciar']);
});

Route::post('webhooks/mercadopago', [ControladorWebhook::class, 'mercadoPago'])
    ->withoutMiddleware(['auth:sanctum']);
