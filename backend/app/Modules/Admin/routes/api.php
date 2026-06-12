<?php

use App\Http\Middleware\AutenticarAdmin;
use App\Modules\Admin\Controllers\ControladorAuthAdmin;
use App\Modules\Admin\Controllers\ControladorClientes;
use App\Modules\Admin\Controllers\ControladorMetricas;
use App\Modules\Admin\Controllers\ControladorPlanos;
use App\Modules\Admin\Controllers\ControladorTracking;
use Illuminate\Support\Facades\Route;

Route::post('api/tracking/pageview', [ControladorTracking::class, 'pageview']);

Route::prefix('api/admin')->group(function () {

    Route::post('auth/login',  [ControladorAuthAdmin::class, 'login']);

    Route::middleware(['auth:sanctum', AutenticarAdmin::class])->group(function () {
        Route::delete('auth/logout',                        [ControladorAuthAdmin::class, 'logout']);
        Route::get('auth/eu',                               [ControladorAuthAdmin::class, 'eu']);
        Route::post('clientes/{id}/impersonar',             [ControladorAuthAdmin::class, 'impersonar']);

        Route::get('dashboard',                             [ControladorMetricas::class, 'dashboard']);

        Route::get('clientes',                              [ControladorClientes::class, 'listar']);
        Route::get('clientes/{id}',                         [ControladorClientes::class, 'detalhe']);
        Route::post('clientes/{id}/suspender',              [ControladorClientes::class, 'suspender']);
        Route::post('clientes/{id}/reativar',               [ControladorClientes::class, 'reativar']);

        Route::get('planos',                                [ControladorPlanos::class, 'listar']);
    });

});
