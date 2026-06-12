<?php

use App\Modules\Painel\Controllers\ControladorAuth;
use App\Modules\Painel\Controllers\ControladorDashboard;
use App\Modules\Painel\Controllers\ControladorSitePainel;
use App\Modules\Painel\Controllers\ControladorPerfil;
use Illuminate\Support\Facades\Route;

Route::prefix('api/painel')->group(function () {

    Route::post('auth/login',  [ControladorAuth::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::delete('auth/logout',           [ControladorAuth::class, 'logout']);
        Route::get('auth/eu',                  [ControladorAuth::class, 'eu']);

        Route::get('dashboard',                [ControladorDashboard::class, 'informacoes']);

        Route::get('site',                     [ControladorSitePainel::class, 'visao']);
        Route::post('site/rollback/{versaoId}',[ControladorSitePainel::class, 'rollback']);

        Route::put('perfil/senha',             [ControladorPerfil::class, 'alterarSenha']);
    });

});
