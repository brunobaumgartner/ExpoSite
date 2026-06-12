<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Core\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class ControladorPlanos extends Controller
{
    public function listar(): JsonResponse
    {
        $planos = Plano::withCount('clientes')->orderBy('preco_mensal')->get();

        return response()->json($planos);
    }
}
