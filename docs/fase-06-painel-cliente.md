# Plataforma SaaS — Fase 5: Painel do Cliente

## Objetivo
Cliente consegue gerenciar seu site, produtos, categorias e agendamentos
visualmente pelo painel web, com preview em tempo real para alterações de
aparência. Tudo sincronizado com o mesmo banco que o agente usa.

## Dependências
- Fases 1 a 4 concluídas
- Vue 3 + Inertia configurados no Laravel
- Sanctum configurado para autenticação SPA

---

## Etapa 1 — Instalar Vue 3 e Inertia

```bash
cd /srv/plataforma/backend

composer require inertiajs/inertia-laravel
npm install @inertiajs/vue3 vue@3 @vitejs/plugin-vue
```

**Por que Inertia?**
O Inertia permite usar Vue 3 no frontend sem criar uma API separada para
o painel. O Laravel renderiza as páginas passando dados como props do Vue —
sem JSON endpoints extras, sem duplicação de rotas. É a escolha ideal para
um painel acoplado ao backend.

---

## Etapa 2 — Criar o middleware de autenticação do painel

Crie `/srv/plataforma/backend/app/Http/Middleware/AutenticarPainel.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AutenticarPainel
{
    /**
     * Garante que o usuário está autenticado antes de acessar o painel.
     * Redireciona para o login se não estiver autenticado.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('painel')->check()) {
            return redirect()->route('painel.login');
        }

        return $next($request);
    }
}
```

---

## Etapa 3 — Criar as rotas do painel

Crie `/srv/plataforma/backend/app/Modules/Core/routes/painel.php`:

```php
<?php

use App\Modules\Core\Controllers\Painel\AuthController;
use App\Modules\Core\Controllers\Painel\ContaController;
use App\Modules\Ecommerce\Controllers\Painel\ProdutoController;
use App\Modules\Ecommerce\Controllers\Painel\CategoriaController;
use App\Modules\Agendamento\Controllers\Painel\AgendamentoController;
use App\Modules\Site\Controllers\Painel\SiteController;
use Illuminate\Support\Facades\Route;

// Autenticação
Route::prefix('painel')->name('painel.')->group(function () {
    Route::get('login',  [AuthController::class, 'exibirLogin'])->name('login');
    Route::post('login', [AuthController::class, 'autenticar'])->name('autenticar');
    Route::post('logout', [AuthController::class, 'sair'])->name('sair');

    // Rotas protegidas
    Route::middleware(['auth.painel', 'identificar.tenant'])->group(function () {
        Route::get('/', [ContaController::class, 'dashboard'])->name('dashboard');

        // Site
        Route::prefix('site')->name('site.')->group(function () {
            Route::get('/', [SiteController::class, 'index'])->name('index');
            Route::put('/', [SiteController::class, 'atualizar'])->name('atualizar');
            Route::get('versoes', [SiteController::class, 'versoes'])->name('versoes');
            Route::post('rollback/{versaoId}', [SiteController::class, 'rollback'])->name('rollback');
        });

        // Produtos
        Route::prefix('produtos')->name('produtos.')->group(function () {
            Route::get('/', [ProdutoController::class, 'index'])->name('index');
            Route::post('/', [ProdutoController::class, 'criar'])->name('criar');
            Route::put('{id}', [ProdutoController::class, 'atualizar'])->name('atualizar');
            Route::delete('{id}', [ProdutoController::class, 'remover'])->name('remover');
        });

        // Categorias
        Route::prefix('categorias')->name('categorias.')->group(function () {
            Route::get('/', [CategoriaController::class, 'index'])->name('index');
            Route::post('/', [CategoriaController::class, 'criar'])->name('criar');
            Route::put('{id}', [CategoriaController::class, 'atualizar'])->name('atualizar');
            Route::delete('{id}', [CategoriaController::class, 'remover'])->name('remover');
        });

        // Agendamentos
        Route::prefix('agendamentos')->name('agendamentos.')->group(function () {
            Route::get('/', [AgendamentoController::class, 'index'])->name('index');
            Route::put('{id}/confirmar', [AgendamentoController::class, 'confirmar'])->name('confirmar');
            Route::put('{id}/cancelar', [AgendamentoController::class, 'cancelar'])->name('cancelar');
        });

        // Conta
        Route::prefix('conta')->name('conta.')->group(function () {
            Route::get('/', [ContaController::class, 'index'])->name('index');
            Route::get('exportar-dados', [ContaController::class, 'exportarDados'])->name('exportar');
            Route::post('solicitar-exclusao', [ContaController::class, 'solicitarExclusao'])->name('excluir');
        });
    });
});
```

---

## Etapa 4 — Criar o ProdutoController do painel

Crie `/srv/plataforma/backend/app/Modules/Ecommerce/Controllers/Painel/ProdutoController.php`:

```php
<?php

namespace App\Modules\Ecommerce\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\DTOs\ProdutoDTO;
use App\Modules\Ecommerce\Services\ProdutoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProdutoController extends Controller
{
    public function __construct(
        private readonly ProdutoService $produtoService
    ) {}

    /**
     * Exibe a listagem de produtos do tenant.
     */
    public function index(): Response
    {
        return Inertia::render('Painel/Produtos/Index', [
            'produtos'   => $this->produtoService->listar(),
            'categorias' => $this->produtoService->listarCategorias(),
        ]);
    }

    /**
     * Cria um novo produto com upload de fotos.
     */
    public function criar(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'nome'         => 'required|string|max:150',
            'descricao'    => 'nullable|string',
            'preco'        => 'required|numeric|min:0',
            'estoque'      => 'nullable|integer|min:0',
            'categoria_id' => 'nullable|exists:tenant.categorias,id',
            'fotos'        => 'nullable|array',
            'fotos.*'      => 'image|max:5120',
            'ativo'        => 'boolean',
        ]);

        $dto = ProdutoDTO::fromRequest($request);

        $this->produtoService->criar($dto, $request->file('fotos', []));

        return redirect()->route('painel.produtos.index')
            ->with('sucesso', 'Produto criado com sucesso.');
    }

    /**
     * Atualiza um produto existente.
     */
    public function atualizar(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'nome'         => 'required|string|max:150',
            'descricao'    => 'nullable|string',
            'preco'        => 'required|numeric|min:0',
            'estoque'      => 'nullable|integer|min:0',
            'categoria_id' => 'nullable|exists:tenant.categorias,id',
            'fotos_novas'  => 'nullable|array',
            'fotos_novas.*' => 'image|max:5120',
            'ativo'        => 'boolean',
        ]);

        $dto = ProdutoDTO::fromRequest($request);

        $this->produtoService->atualizar($id, $dto, $request->file('fotos_novas', []));

        return redirect()->route('painel.produtos.index')
            ->with('sucesso', 'Produto atualizado.');
    }

    /**
     * Remove um produto (soft delete).
     */
    public function remover(int $id): \Illuminate\Http\RedirectResponse
    {
        $this->produtoService->remover($id);

        return redirect()->route('painel.produtos.index')
            ->with('sucesso', 'Produto removido.');
    }
}
```

---

## Etapa 5 — Criar o ContaController (LGPD)

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/Painel/ContaController.php`:

```php
<?php

namespace App\Modules\Core\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Modules\Core\Services\ContaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContaController extends Controller
{
    public function __construct(
        private readonly ContaService $contaService
    ) {}

    /**
     * Exibe o dashboard principal do painel.
     */
    public function dashboard(): Response
    {
        $tenant = request()->tenant;

        return Inertia::render('Painel/Dashboard', [
            'uso'   => $this->contaService->usoDoMes($tenant),
            'plano' => $tenant->plano,
        ]);
    }

    /**
     * Exibe as informações da conta e opções LGPD.
     */
    public function index(): Response
    {
        $tenant = request()->tenant;

        return Inertia::render('Painel/Conta/Index', [
            'tenant'  => $tenant,
            'faturas' => $this->contaService->historicoFaturas($tenant),
        ]);
    }

    /**
     * Exporta todos os dados do tenant em JSON (direito de portabilidade LGPD).
     */
    public function exportarDados(): StreamedResponse
    {
        $tenant = request()->tenant;
        $dados  = $this->contaService->exportarDados($tenant);

        return response()->streamDownload(function () use ($dados) {
            echo json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, "dados-{$tenant->slug}.json", ['Content-Type' => 'application/json']);
    }

    /**
     * Registra a solicitação de exclusão de conta (direito ao esquecimento LGPD).
     * A exclusão real ocorre após o período de carência de 30 dias.
     */
    public function solicitarExclusao(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tenant = request()->tenant;

        $this->contaService->solicitarExclusao($tenant);

        return redirect()->route('painel.conta.index')
            ->with('aviso', 'Solicitação de exclusão registrada. Sua conta será encerrada em 30 dias.');
    }
}
```

---

## Etapa 6 — Criar as migrations do módulo Ecommerce no tenant

Crie `/srv/plataforma/backend/database/migrations/Ecommerce/2024_01_05_000001_criar_tabelas_ecommerce.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->string('slug', 100)->unique();
            $table->unsignedTinyInteger('ordem')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::connection('tenant')->create('produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->nullable()->constrained('categorias')->nullOnDelete();
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->decimal('preco', 10, 2);
            $table->unsignedInteger('estoque')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::connection('tenant')->create('produto_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->cascadeOnDelete();
            $table->string('caminho', 500);
            $table->unsignedTinyInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('produto_fotos');
        Schema::connection('tenant')->dropIfExists('produtos');
        Schema::connection('tenant')->dropIfExists('categorias');
    }
};
```

---

## Etapa 7 — Criar as migrations do módulo Agendamento no tenant

Crie `/srv/plataforma/backend/database/migrations/Agendamento/2024_01_06_000001_criar_tabelas_agendamento.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('servicos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->decimal('preco', 10, 2)->nullable();
            $table->unsignedSmallInteger('duracao_minutos');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::connection('tenant')->create('horarios_disponiveis', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('dia_semana');
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::connection('tenant')->create('agendamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servico_id')->constrained('servicos');
            $table->string('cliente_nome', 150);
            $table->string('cliente_telefone', 30)->nullable();
            $table->dateTime('data_hora');
            $table->enum('status', ['pendente', 'confirmado', 'cancelado', 'concluido'])
                  ->default('pendente');
            $table->text('observacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('agendamentos');
        Schema::connection('tenant')->dropIfExists('horarios_disponiveis');
        Schema::connection('tenant')->dropIfExists('servicos');
    }
};
```

---

## Etapa 8 — Criar o SiteController do painel (com preview)

Crie `/srv/plataforma/backend/app/Modules/Site/Controllers/Painel/SiteController.php`:

```php
<?php

namespace App\Modules\Site\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Modules\Site\Services\SiteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function __construct(
        private readonly SiteService $siteService
    ) {}

    /**
     * Exibe o editor visual do site com as configurações atuais.
     */
    public function index(): Response
    {
        return Inertia::render('Painel/Site/Index', [
            'configuracoes' => $this->siteService->configuracoes(),
            'versoes'       => $this->siteService->listarVersoes(5),
            'schema'        => $this->siteService->schema(),
        ]);
    }

    /**
     * Salva as configurações do site e dispara o rebuild.
     */
    public function atualizar(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tenant        = $request->tenant;
        $configuracoes = $request->except(['_token', '_method']);

        $this->siteService->atualizar($tenant, $configuracoes, 'Atualização via painel');

        return redirect()->route('painel.site.index')
            ->with('sucesso', 'Site atualizado! As mudanças aparecem em instantes.');
    }

    /**
     * Retorna um preview das configurações sem salvar (para preview em tempo real).
     */
    public function preview(Request $request): JsonResponse
    {
        $configuracoes = $request->all();
        $html          = $this->siteService->gerarPreview($configuracoes);

        return response()->json(['html' => $html]);
    }

    /**
     * Lista todas as versões do site.
     */
    public function versoes(): Response
    {
        return Inertia::render('Painel/Site/Versoes', [
            'versoes' => $this->siteService->listarVersoes(),
        ]);
    }

    /**
     * Restaura o site para uma versão anterior.
     */
    public function rollback(int $versaoId): \Illuminate\Http\RedirectResponse
    {
        $tenant = request()->tenant;

        $this->siteService->rollback($tenant, $versaoId);

        return redirect()->route('painel.site.index')
            ->with('sucesso', "Site restaurado para a versão #{$versaoId}.");
    }
}
```

---

## Checklist final da Fase 5

- [ ] Vue 3 + Inertia instalados
- [ ] Middleware `AutenticarPainel` criado
- [ ] Rotas do painel criadas (auth + protegidas)
- [ ] `ProdutoController` criado (CRUD + upload de fotos)
- [ ] `CategoriaController` criado
- [ ] `AgendamentoController` criado (confirmar/cancelar)
- [ ] `SiteController` criado com preview em tempo real
- [ ] `ContaController` criado (dashboard + LGPD)
- [ ] Migrations de Ecommerce criadas (categorias, produtos, produto_fotos)
- [ ] Migrations de Agendamento criadas (servicos, horarios, agendamentos)
- [ ] Páginas Vue criadas (Dashboard, Produtos, Categorias, Site, Agendamentos, Conta)
- [ ] Upload de imagens funcionando e salvando na VPS
- [ ] Exportação de dados LGPD funcionando
- [ ] Solicitação de exclusão de conta funcionando

**Fase 5 concluída → partir para a Fase 6 (Painel Administrativo)**
