<?php

namespace App\Modules\Admin\Controllers;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Models\PreRegistro;
use App\Modules\Core\Models\Visualizacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class ControladorMetricas extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $totalClientes   = Cliente::count();
        $clientesAtivos  = Cliente::where('status', 'ativo')->count();
        $clientesSusp    = Cliente::where('status', 'suspenso')->count();

        $mrr = Cliente::where('status', 'ativo')
            ->join('planos', 'clientes.plano_id', '=', 'planos.id')
            ->sum('planos.preco_mensal');

        $totalMensagens = Cliente::sum('mensagens_usadas_mes');
        $totalTokens    = Cliente::sum('tokens_usados_mes');

        $receitaMes = Fatura::where('status', 'pago')
            ->whereMonth('pago_em', now()->month)
            ->whereYear('pago_em', now()->year)
            ->sum('valor');

        $preRegistros7d = PreRegistro::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        $visualizacoes7d = Visualizacao::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as dia, COUNT(*) as total')
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        return response()->json([
            'clientes' => [
                'total'    => $totalClientes,
                'ativos'   => $clientesAtivos,
                'suspensos'=> $clientesSusp,
            ],
            'financeiro' => [
                'mrr'        => (float) $mrr,
                'receita_mes'=> (float) $receitaMes,
            ],
            'uso' => [
                'mensagens_mes' => (int) $totalMensagens,
                'tokens_mes'    => (int) $totalTokens,
            ],
            'pre_registros_7d'  => $preRegistros7d,
            'visualizacoes_7d'  => $visualizacoes7d,
        ]);
    }
}
