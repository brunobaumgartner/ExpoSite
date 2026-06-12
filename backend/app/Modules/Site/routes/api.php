<?php

use App\Http\Middleware\AutenticacaoInterna;
use App\Modules\Site\Controllers\ControladorSite;
use Illuminate\Support\Facades\Route;

Route::prefix('api/interno/clientes/{clienteId}/site')
    ->middleware(AutenticacaoInterna::class)
    ->group(function () {
        Route::post('atualizar',  [ControladorSite::class, 'atualizar']);
        Route::get('versoes',     [ControladorSite::class, 'versoes']);
        Route::post('rollback',   [ControladorSite::class, 'rollback']);
    });
