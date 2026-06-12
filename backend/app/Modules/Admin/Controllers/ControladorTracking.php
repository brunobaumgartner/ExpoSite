<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\Visualizacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ControladorTracking extends Controller
{
    public function pageview(Request $request): JsonResponse
    {
        $request->validate([
            'slug'    => 'required|string|max:100',
            'caminho' => 'nullable|string|max:255',
        ]);

        $cliente = Cliente::where('slug', $request->slug)->first();

        if (!$cliente || !$cliente->estaAtivo()) {
            return response()->json(['ok' => false]);
        }

        Visualizacao::create([
            'cliente_id' => $cliente->id,
            'caminho'    => $request->input('caminho', '/'),
            'ip_hash'    => hash('sha256', $request->ip() . date('Y-m-d')),
            'referrer'   => $request->input('referrer') ? substr($request->input('referrer'), 0, 255) : null,
        ]);

        return response()->json(['ok' => true]);
    }
}
