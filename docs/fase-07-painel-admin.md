# Plataforma SaaS — Fase 6: Painel Administrativo

## Objetivo
Você consegue gerenciar toda a plataforma: visualizar tenants, suspender
contas, gerenciar planos, monitorar o pool de bots, acompanhar métricas
financeiras e receber alertas quando o pool de bots estiver baixo.

## Dependências
- Fases 1 a 5 concluídas
- Autenticação de admin separada dos tenants

---

## Etapa 1 — Criar migration de admins da plataforma

Crie `/srv/plataforma/backend/database/migrations/2024_01_07_000001_criar_tabela_admins.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->string('email', 150)->unique();
            $table->string('senha');
            $table->timestamp('ultimo_acesso_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
```

**Por que admins em tabela separada?**
Administradores da plataforma são entidades completamente diferentes dos
usuários de tenant. Misturar as duas na mesma tabela criaria acoplamento
desnecessário e risco de um usuário de tenant conseguir privilégios de admin
por bug de query.

---

## Etapa 2 — Criar as rotas do painel admin

Crie `/srv/plataforma/backend/app/Modules/Core/routes/admin.php`:

```php
<?php

use App\Modules\Core\Controllers\Admin\AdminAuthController;
use App\Modules\Core\Controllers\Admin\TenantAdminController;
use App\Modules\Core\Controllers\Admin\PlanoAdminController;
use App\Modules\Core\Controllers\Admin\BotPoolAdminController;
use App\Modules\Core\Controllers\Admin\MetricasAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login',  [AdminAuthController::class, 'exibirLogin'])->name('login');
    Route::post('login', [AdminAuthController::class, 'autenticar'])->name('autenticar');
    Route::post('logout', [AdminAuthController::class, 'sair'])->name('sair');

    Route::middleware('auth.admin')->group(function () {
        Route::get('/', [MetricasAdminController::class, 'dashboard'])->name('dashboard');

        // Tenants
        Route::prefix('tenants')->name('tenants.')->group(function () {
            Route::get('/', [TenantAdminController::class, 'index'])->name('index');
            Route::get('{id}', [TenantAdminController::class, 'detalhes'])->name('detalhes');
            Route::put('{id}/suspender', [TenantAdminController::class, 'suspender'])->name('suspender');
            Route::put('{id}/reativar', [TenantAdminController::class, 'reativar'])->name('reativar');
        });

        // Planos
        Route::prefix('planos')->name('planos.')->group(function () {
            Route::get('/', [PlanoAdminController::class, 'index'])->name('index');
            Route::post('/', [PlanoAdminController::class, 'criar'])->name('criar');
            Route::put('{id}', [PlanoAdminController::class, 'atualizar'])->name('atualizar');
        });

        // Pool de bots
        Route::prefix('bot-pool')->name('bot-pool.')->group(function () {
            Route::get('/', [BotPoolAdminController::class, 'index'])->name('index');
            Route::post('/', [BotPoolAdminController::class, 'adicionar'])->name('adicionar');
        });

        // Métricas
        Route::get('metricas', [MetricasAdminController::class, 'index'])->name('metricas');
    });
});
```

---

## Etapa 3 — Criar o TenantAdminController

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/Admin/TenantAdminController.php`:

```php
<?php

namespace App\Modules\Core\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Services\TenantService;
use Inertia\Inertia;
use Inertia\Response;

class TenantAdminController extends Controller
{
    public function __construct(
        private readonly TenantService $tenantService
    ) {}

    /**
     * Lista todos os tenants com filtros de busca e status.
     */
    public function index(): Response
    {
        $tenants = Tenant::with('plano')
            ->withCount('faturas')
            ->when(request('busca'), fn($query, $busca) =>
                $query->where('slug', 'like', "%{$busca}%")
            )
            ->when(request('status'), fn($query, $status) =>
                $query->where('status', $status)
            )
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
        ]);
    }

    /**
     * Exibe os detalhes completos de um tenant.
     */
    public function detalhes(int $id): Response
    {
        $tenant = Tenant::with(['plano', 'faturas'])->findOrFail($id);

        $this->tenantService->configurarConexao($tenant);

        return Inertia::render('Admin/Tenants/Detalhes', [
            'tenant'  => $tenant,
            'uso'     => $this->tenantService->usoDoMes($tenant),
        ]);
    }

    /**
     * Suspende um tenant manualmente.
     */
    public function suspender(int $id): \Illuminate\Http\RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status'      => 'suspenso',
            'suspenso_em' => now(),
        ]);

        return redirect()->route('admin.tenants.index')
            ->with('sucesso', "Tenant {$tenant->slug} suspenso.");
    }

    /**
     * Reativa um tenant suspenso manualmente.
     */
    public function reativar(int $id): \Illuminate\Http\RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status'      => 'ativo',
            'suspenso_em' => null,
        ]);

        return redirect()->route('admin.tenants.index')
            ->with('sucesso', "Tenant {$tenant->slug} reativado.");
    }
}
```

---

## Etapa 4 — Criar o BotPoolAdminController

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/Admin/BotPoolAdminController.php`:

```php
<?php

namespace App\Modules\Core\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\BotPool;
use App\Modules\Core\Services\BotPoolService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BotPoolAdminController extends Controller
{
    public function __construct(
        private readonly BotPoolService $botPoolService
    ) {}

    /**
     * Exibe o status do pool de bots com alerta quando estiver baixo.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/BotPool/Index', [
            'bots'        => BotPool::with('tenant')->latest()->get(),
            'disponiveis' => $this->botPoolService->quantidadeDisponivel(),
            'pool_baixo'  => $this->botPoolService->poolBaixo(),
        ]);
    }

    /**
     * Adiciona um novo token de bot ao pool.
     */
    public function adicionar(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'token'    => 'required|string|unique:bot_pool,token',
            'username' => 'nullable|string|max:100',
        ]);

        BotPool::create([
            'token'    => $request->input('token'),
            'username' => $request->input('username'),
            'status'   => 'disponivel',
        ]);

        return redirect()->route('admin.bot-pool.index')
            ->with('sucesso', 'Bot adicionado ao pool.');
    }
}
```

---

## Etapa 5 — Criar o MetricasAdminController

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/Admin/MetricasAdminController.php`:

```php
<?php

namespace App\Modules\Core\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Services\BotPoolService;
use Inertia\Inertia;
use Inertia\Response;

class MetricasAdminController extends Controller
{
    public function __construct(
        private readonly BotPoolService $botPoolService
    ) {}

    /**
     * Exibe o dashboard com as métricas principais da plataforma.
     */
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'total_tenants'   => Tenant::count(),
            'tenants_ativos'  => Tenant::where('status', 'ativo')->count(),
            'mrr'             => $this->calcularMrr(),
            'churn_mes'       => $this->calcularChurn(),
            'pool_disponivel' => $this->botPoolService->quantidadeDisponivel(),
            'pool_baixo'      => $this->botPoolService->poolBaixo(),
        ]);
    }

    /**
     * Calcula o MRR (Monthly Recurring Revenue) atual.
     */
    private function calcularMrr(): float
    {
        return Tenant::where('status', 'ativo')
            ->with('plano')
            ->get()
            ->sum(fn($tenant) => $tenant->plano->preco_mensal);
    }

    /**
     * Calcula o churn do mês atual (tenants cancelados / total do início do mês).
     */
    private function calcularChurn(): float
    {
        $canceladosMes  = Tenant::where('status', 'cancelado')
            ->whereMonth('updated_at', now()->month)
            ->count();

        $totalInicioMes = Tenant::whereDate('created_at', '<', now()->startOfMonth())->count();

        if ($totalInicioMes === 0) {
            return 0.0;
        }

        return round(($canceladosMes / $totalInicioMes) * 100, 2);
    }
}
```

---

## Etapa 6 — Criar o Command de alerta do pool

Crie `/srv/plataforma/backend/app/Console/Commands/AlertarPoolBaixo.php`:

```php
<?php

namespace App\Console\Commands;

use App\Modules\Core\Services\BotPoolService;
use App\Modules\Core\Services\EmailService;
use Illuminate\Console\Command;

class AlertarPoolBaixo extends Command
{
    protected $signature   = 'bot-pool:alertar-baixo';
    protected $description = 'Envia alerta por email quando o pool de bots estiver baixo.';

    /**
     * Verifica o pool e envia alerta se estiver com menos de 10 bots disponíveis.
     */
    public function handle(BotPoolService $botPoolService, EmailService $emailService): void
    {
        if (!$botPoolService->poolBaixo()) {
            return;
        }

        $disponivel = $botPoolService->quantidadeDisponivel();

        $emailService->enviarAlertaAdmin(
            assunto: "⚠️ Pool de bots baixo: {$disponivel} disponíveis",
            mensagem: "O pool de bots está com apenas {$disponivel} tokens disponíveis. "
                    . "Adicione novos bots pelo painel administrativo."
        );

        $this->warn("Pool baixo: {$disponivel} bots disponíveis. Alerta enviado.");
    }
}
```

Registre no scheduler:

```php
Schedule::command('bot-pool:alertar-baixo')->hourly();
```

---

## Etapa 7 — Rodar as migrations

```bash
docker exec -it plataforma_backend php artisan migrate --force
```

---

## Checklist final da Fase 6

- [ ] Migration `admins` criada e executada
- [ ] Rotas do painel admin criadas e protegidas
- [ ] `TenantAdminController` criado (listar, detalhes, suspender, reativar)
- [ ] `PlanoAdminController` criado (listar, criar, editar)
- [ ] `BotPoolAdminController` criado (listar, adicionar)
- [ ] `MetricasAdminController` criado (dashboard com MRR e churn)
- [ ] Command `AlertarPoolBaixo` criado e agendado por hora
- [ ] Páginas Vue do admin criadas (Dashboard, Tenants, Planos, BotPool)
- [ ] Primeiro admin criado via `php artisan tinker`
- [ ] MRR e churn calculando corretamente
- [ ] Alerta de pool baixo chegando por email

**Fase 6 concluída → partir para a Fase 7 (Hardening e Produção)**
