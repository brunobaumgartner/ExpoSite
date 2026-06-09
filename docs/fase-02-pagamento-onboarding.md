# Plataforma SaaS — Fase 2: Pagamento e Onboarding

## Objetivo
Cliente consegue se cadastrar, escolher um plano, pagar com cartão via
Mercado Pago e ter sua conta provisionada automaticamente — subdomínio
reservado, banco criado, bot do pool atribuído e link do Telegram enviado
por email. Tudo sem intervenção manual.

## Dependências
- Fase 1 concluída (Laravel, banco central, multi-tenancy)
- Conta no Mercado Pago com acesso à API de assinaturas
- Provedor de email transacional configurado (SendGrid ou Mailgun)

---

## Etapa 1 — Instalar dependências

```bash
cd /srv/plataforma/backend

# SDK do Mercado Pago
composer require mercadopago/dx-php

# Filas assíncronas (provisionamento em background)
composer require predis/predis
```

**Por que filas?**
O provisionamento do tenant (criar schema, rodar migrations, atribuir bot)
pode levar alguns segundos. Colocar em fila garante que o cliente recebe
a resposta do pagamento imediatamente, e o provisionamento acontece em
background sem timeout de HTTP.

---

## Etapa 2 — Criar migrations do banco central (Fase 2)

Crie `/srv/plataforma/backend/database/migrations/2024_01_02_000001_criar_tabela_faturas.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('mp_assinatura_id', 100)->nullable()->unique();
            $table->string('mp_pagamento_id', 100)->nullable();
            $table->decimal('valor', 10, 2);
            $table->enum('ciclo', ['mensal', 'anual']);
            $table->enum('status', ['pendente', 'aprovado', 'recusado', 'cancelado']);
            $table->timestamp('pago_em')->nullable();
            $table->timestamp('vence_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faturas');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/2024_01_02_000002_criar_tabela_cadastros_pendentes.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cadastros_pendentes', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->json('dados');
            $table->string('mp_preferencia_id', 100)->nullable();
            $table->enum('status', ['aguardando_pagamento', 'processando', 'concluido', 'falhou']);
            $table->timestamp('expira_em');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cadastros_pendentes');
    }
};
```

**Por que `cadastros_pendentes`?**
O fluxo de cadastro tem duas etapas separadas no tempo: o cliente preenche
o formulário e depois paga. Entre essas etapas, os dados ficam em
`cadastros_pendentes` com um token único. Quando o webhook do Mercado Pago
confirma o pagamento, o sistema usa esse token para localizar os dados e
disparar o provisionamento. Sem essa tabela, seria impossível correlacionar
o pagamento com o cadastro.

---

## Etapa 3 — Criar o CadastroController

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/CadastroController.php`:

```php
<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\DTOs\CadastroDTO;
use App\Modules\Core\Services\CadastroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CadastroController extends Controller
{
    public function __construct(
        private readonly CadastroService $cadastroService
    ) {}

    /**
     * Verifica em tempo real se um slug está disponível.
     */
    public function verificarSlug(string $slug): JsonResponse
    {
        $disponivel = $this->cadastroService->slugDisponivel($slug);

        return response()->json([
            'slug'       => $slug,
            'disponivel' => $disponivel,
            'sugestoes'  => $disponivel ? [] : $this->cadastroService->sugerirSlugs($slug),
        ]);
    }

    /**
     * Recebe os dados do formulário, valida e cria a preferência
     * de pagamento no Mercado Pago.
     */
    public function iniciar(Request $request): JsonResponse
    {
        $request->validate([
            'nome_negocio' => 'required|string|max:150',
            'slug'         => 'required|string|max:100|regex:/^[a-z0-9-]+$/',
            'tipo_site'    => 'required|in:landing-page,institucional,ecommerce,cardapio,agendamento',
            'plano_id'     => 'required|exists:planos,id',
            'ciclo'        => 'required|in:mensal,anual',
            'nome'         => 'required|string|max:150',
            'email'        => 'required|email|unique:tenants,email',
            'telefone'     => 'required|string|max:30',
            'senha'        => 'required|string|min:8|confirmed',
        ]);

        $dto = CadastroDTO::fromRequest($request);

        $resultado = $this->cadastroService->iniciarCadastro($dto);

        return response()->json($resultado, 201);
    }
}
```

---

## Etapa 4 — Criar o CadastroDTO

Crie `/srv/plataforma/backend/app/Modules/Core/DTOs/CadastroDTO.php`:

```php
<?php

namespace App\Modules\Core\DTOs;

use Illuminate\Http\Request;

class CadastroDTO
{
    public function __construct(
        public readonly string $nomeNegocio,
        public readonly string $slug,
        public readonly string $tipoSite,
        public readonly int    $planoId,
        public readonly string $ciclo,
        public readonly string $nome,
        public readonly string $email,
        public readonly string $telefone,
        public readonly string $senha,
    ) {}

    /**
     * Cria o DTO a partir de um Request do Laravel.
     */
    public static function fromRequest(Request $request): self
    {
        return new self(
            nomeNegocio: $request->input('nome_negocio'),
            slug:        $request->input('slug'),
            tipoSite:    $request->input('tipo_site'),
            planoId:     (int) $request->input('plano_id'),
            ciclo:       $request->input('ciclo'),
            nome:        $request->input('nome'),
            email:       $request->input('email'),
            telefone:    $request->input('telefone'),
            senha:       $request->input('senha'),
        );
    }
}
```

**Por que DTO?**
O DTO (Data Transfer Object) transporta os dados do request validado até
o Service sem expor o objeto `Request` do Laravel nas camadas internas.
Isso aplica o Dependency Inversion Principle — o Service não depende do
HTTP, apenas dos dados que precisa. Facilita testes unitários e reutilização.

---

## Etapa 5 — Criar o CadastroService

Crie `/srv/plataforma/backend/app/Modules/Core/Services/CadastroService.php`:

```php
<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\DTOs\CadastroDTO;
use App\Modules\Core\Jobs\ProvisionarTenantJob;
use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Models\Plano;
use App\Modules\Core\Models\Tenant;
use Illuminate\Support\Str;

class CadastroService
{
    public function __construct(
        private readonly MercadoPagoService $mercadoPagoService
    ) {}

    /**
     * Verifica se o slug está disponível para uso.
     */
    public function slugDisponivel(string $slug): bool
    {
        return !Tenant::where('slug', $slug)->exists();
    }

    /**
     * Gera sugestões de slugs alternativos quando o desejado está ocupado.
     */
    public function sugerirSlugs(string $slug): array
    {
        $sugestoes = [];

        for ($i = 1; $i <= 3; $i++) {
            $candidato = "{$slug}-{$i}";
            if ($this->slugDisponivel($candidato)) {
                $sugestoes[] = $candidato;
            }
        }

        return $sugestoes;
    }

    /**
     * Inicia o fluxo de cadastro: valida slug, salva dados pendentes
     * e cria a preferência de pagamento no Mercado Pago.
     */
    public function iniciarCadastro(CadastroDTO $dto): array
    {
        abort_if(!$this->slugDisponivel($dto->slug), 422, 'Slug indisponível.');

        $plano = Plano::findOrFail($dto->planoId);

        $token = Str::random(64);

        $cadastroPendente = CadastroPendente::create([
            'token'   => $token,
            'dados'   => $dto,
            'status'  => 'aguardando_pagamento',
            'expira_em' => now()->addHours(2),
        ]);

        $preferencia = $this->mercadoPagoService->criarPreferencia(
            plano:    $plano,
            ciclo:    $dto->ciclo,
            email:    $dto->email,
            token:    $token,
        );

        $cadastroPendente->update([
            'mp_preferencia_id' => $preferencia['id'],
        ]);

        return [
            'token'       => $token,
            'checkout_url' => $preferencia['init_point'],
        ];
    }
}
```

---

## Etapa 6 — Criar o MercadoPagoService

Crie `/srv/plataforma/backend/app/Modules/Core/Services/MercadoPagoService.php`:

```php
<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Plano;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
    }

    /**
     * Cria uma preferência de pagamento no Mercado Pago.
     * Retorna a URL de checkout para redirecionar o cliente.
     */
    public function criarPreferencia(Plano $plano, string $ciclo, string $email, string $token): array
    {
        $valor = $ciclo === 'anual' ? $plano->preco_anual : $plano->preco_mensal;

        $client = new PreferenceClient();

        $preferencia = $client->create([
            'items' => [[
                'title'       => "Plano {$plano->nome} — {$ciclo}",
                'quantity'    => 1,
                'unit_price'  => (float) $valor,
                'currency_id' => 'BRL',
            ]],
            'payer' => [
                'email' => $email,
            ],
            'back_urls' => [
                'success' => config('app.url') . "/cadastro/sucesso?token={$token}",
                'failure' => config('app.url') . "/cadastro/falha?token={$token}",
                'pending' => config('app.url') . "/cadastro/pendente?token={$token}",
            ],
            'notification_url' => config('app.url') . '/webhooks/mercadopago',
            'external_reference' => $token,
            'auto_return' => 'approved',
        ]);

        return [
            'id'         => $preferencia->id,
            'init_point' => $preferencia->init_point,
        ];
    }

    /**
     * Valida a assinatura do webhook para garantir que veio do Mercado Pago.
     */
    public function validarWebhook(string $assinatura, string $payload): bool
    {
        $segredo = config('services.mercadopago.webhook_secret');
        $esperado = hash_hmac('sha256', $payload, $segredo);

        return hash_equals($esperado, $assinatura);
    }
}
```

---

## Etapa 7 — Criar o WebhookController

Crie `/srv/plataforma/backend/app/Modules/Core/Controllers/WebhookController.php`:

```php
<?php

namespace App\Modules\Core\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Jobs\ProvisionarTenantJob;
use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function __construct(
        private readonly MercadoPagoService $mercadoPagoService
    ) {}

    /**
     * Recebe e processa os webhooks do Mercado Pago.
     * Valida a assinatura antes de qualquer ação.
     */
    public function mercadoPago(Request $request): Response
    {
        $assinatura = $request->header('x-signature', '');
        $payload    = $request->getContent();

        if (!$this->mercadoPagoService->validarWebhook($assinatura, $payload)) {
            return response('Assinatura inválida.', 401);
        }

        $tipo = $request->input('type');
        $dados = $request->input('data', []);

        if ($tipo === 'payment' && isset($dados['id'])) {
            $this->processarPagamento($dados['id']);
        }

        return response('OK', 200);
    }

    /**
     * Processa um pagamento aprovado e dispara o provisionamento do tenant.
     */
    private function processarPagamento(string $pagamentoId): void
    {
        $pagamento = $this->mercadoPagoService->buscarPagamento($pagamentoId);

        if ($pagamento['status'] !== 'approved') {
            return;
        }

        $token = $pagamento['external_reference'];

        $cadastro = CadastroPendente::where('token', $token)
            ->where('status', 'aguardando_pagamento')
            ->where('expira_em', '>', now())
            ->first();

        if (!$cadastro) {
            return;
        }

        $cadastro->update(['status' => 'processando']);

        ProvisionarTenantJob::dispatch($cadastro->id, $pagamentoId);
    }
}
```

---

## Etapa 8 — Criar o Job de provisionamento

Crie `/srv/plataforma/backend/app/Modules/Core/Jobs/ProvisionarTenantJob.php`:

```php
<?php

namespace App\Modules\Core\Jobs;

use App\Modules\Core\Models\CadastroPendente;
use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Services\BotPoolService;
use App\Modules\Core\Services\EmailService;
use App\Modules\Core\Services\TenantService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProvisionarTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private readonly int    $cadastroId,
        private readonly string $pagamentoId,
    ) {}

    /**
     * Executa o provisionamento completo do tenant em background.
     * Em caso de falha, tenta novamente até 3 vezes com 30s de espera.
     */
    public function handle(
        TenantService  $tenantService,
        BotPoolService $botPoolService,
        EmailService   $emailService,
    ): void {
        $cadastro = CadastroPendente::findOrFail($this->cadastroId);
        $dados    = $cadastro->dados;

        DB::transaction(function () use ($cadastro, $dados, $tenantService, $botPoolService, $emailService) {

            $tenant = Tenant::create([
                'slug'      => $dados['slug'],
                'subdominio' => $dados['slug'] . '.' . config('app.dominio'),
                'plano_id'  => $dados['plano_id'],
                'status'    => 'ativo',
            ]);

            $modulos = $tenantService->modulosPorTipo($dados['tipo_site']);
            $tenantService->provisionar($tenant, $modulos);

            $tenantService->criarUsuarioAdmin($tenant, [
                'nome'     => $dados['nome'],
                'email'    => $dados['email'],
                'senha'    => Hash::make($dados['senha']),
                'telefone' => $dados['telefone'],
            ]);

            $bot = $botPoolService->atribuir($tenant);

            Fatura::create([
                'tenant_id'    => $tenant->id,
                'mp_pagamento_id' => $this->pagamentoId,
                'valor'        => $dados['valor'],
                'ciclo'        => $dados['ciclo'],
                'status'       => 'aprovado',
                'pago_em'      => now(),
                'vence_em'     => $dados['ciclo'] === 'anual' ? now()->addYear() : now()->addMonth(),
            ]);

            $emailService->enviarBoasVindas($tenant, $dados['email'], $bot->link_convite);

            $cadastro->update(['status' => 'concluido']);
        });
    }

    /**
     * Trata a falha definitiva após todas as tentativas esgotadas.
     */
    public function failed(\Throwable $exception): void
    {
        CadastroPendente::where('id', $this->cadastroId)
            ->update(['status' => 'falhou']);
    }
}
```

**Por que `DB::transaction` no job?**
O provisionamento envolve várias operações (criar tenant, schema, usuário,
fatura, atribuir bot). Se qualquer etapa falhar, a transação faz rollback
de tudo — evitando estados inconsistentes como um tenant criado sem bot ou
sem usuário admin. O job tem `tries = 3` para casos de falha temporária
(banco indisponível, API do MP fora).

---

## Etapa 9 — Criar o BotPoolService

Crie `/srv/plataforma/backend/app/Modules/Core/Services/BotPoolService.php`:

```php
<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\BotPool;
use App\Modules\Core\Models\Tenant;
use Illuminate\Support\Facades\DB;

class BotPoolService
{
    /**
     * Atribui o próximo bot disponível do pool ao tenant.
     * Usa lock pessimista para evitar atribuição duplicada em concorrência.
     */
    public function atribuir(Tenant $tenant): BotPool
    {
        return DB::transaction(function () use ($tenant) {
            $bot = BotPool::where('status', 'disponivel')
                ->lockForUpdate()
                ->firstOrFail();

            $bot->update([
                'status'    => 'em_uso',
                'tenant_id' => $tenant->id,
            ]);

            return $bot;
        });
    }

    /**
     * Retorna a quantidade de bots disponíveis no pool.
     */
    public function quantidadeDisponivel(): int
    {
        return BotPool::where('status', 'disponivel')->count();
    }

    /**
     * Verifica se o pool está baixo e requer atenção.
     */
    public function poolBaixo(): bool
    {
        return $this->quantidadeDisponivel() < 10;
    }
}
```

**Por que `lockForUpdate`?**
Em ambiente com múltiplos cadastros simultâneos, dois jobs poderiam
selecionar o mesmo bot disponível antes que o primeiro atualizasse o status.
O `lockForUpdate` é um lock pessimista do MySQL — o segundo job espera o
primeiro liberar antes de ler, garantindo que cada bot seja atribuído a
um único tenant.

---

## Etapa 10 — Criar o EmailService

Crie `/srv/plataforma/backend/app/Modules/Core/Services/EmailService.php`:

```php
<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Tenant;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Envia o email de boas-vindas com o link do Telegram para o novo cliente.
     */
    public function enviarBoasVindas(Tenant $tenant, string $email, string $linkTelegram): void
    {
        Mail::send('emails.boas-vindas', [
            'tenant'        => $tenant,
            'link_telegram' => $linkTelegram,
            'link_painel'   => config('app.url') . "/painel",
        ], function ($mensagem) use ($email, $tenant) {
            $mensagem->to($email)
                     ->subject("Bem-vindo à plataforma! Seu site está pronto para ser criado 🚀");
        });
    }

    /**
     * Envia aviso de vencimento próximo (3 dias antes).
     */
    public function enviarAvisoVencimento(Tenant $tenant, string $email): void
    {
        Mail::send('emails.aviso-vencimento', [
            'tenant' => $tenant,
        ], function ($mensagem) use ($email) {
            $mensagem->to($email)
                     ->subject("Seu plano vence em 3 dias — renove para não perder o acesso");
        });
    }

    /**
     * Envia aviso de suspensão após vencimento sem renovação.
     */
    public function enviarAvisoSuspensao(Tenant $tenant, string $email): void
    {
        Mail::send('emails.suspensao', [
            'tenant' => $tenant,
        ], function ($mensagem) use ($email) {
            $mensagem->to($email)
                     ->subject("Seu site foi suspenso — reative agora");
        });
    }
}
```

---

## Etapa 11 — Criar o scheduler de suspensão automática

Crie `/srv/plataforma/backend/app/Console/Commands/SuspenderTenantVencido.php`:

```php
<?php

namespace App\Console\Commands;

use App\Modules\Core\Models\Fatura;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Services\EmailService;
use Illuminate\Console\Command;

class SuspenderTenantVencido extends Command
{
    protected $signature   = 'tenants:suspender-vencidos';
    protected $description = 'Suspende tenants com fatura vencida sem renovação.';

    /**
     * Busca tenants ativos com fatura vencida e os suspende automaticamente.
     */
    public function handle(EmailService $emailService): void
    {
        $faturasVencidas = Fatura::where('status', 'aprovado')
            ->where('vence_em', '<', now())
            ->with('tenant.usuarioAdmin')
            ->get();

        foreach ($faturasVencidas as $fatura) {
            $tenant = $fatura->tenant;

            if (!$tenant || !$tenant->estaAtivo()) {
                continue;
            }

            $tenant->update([
                'status'      => 'suspenso',
                'suspenso_em' => now(),
            ]);

            $emailService->enviarAvisoSuspensao(
                $tenant,
                $tenant->usuarioAdmin->email
            );

            $this->info("Tenant {$tenant->slug} suspenso.");
        }
    }
}
```

Registre no scheduler em `/srv/plataforma/backend/routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('tenants:suspender-vencidos')->daily();
```

---

## Etapa 12 — Criar as rotas

Crie `/srv/plataforma/backend/app/Modules/Core/routes/api.php`:

```php
<?php

use App\Modules\Core\Controllers\CadastroController;
use App\Modules\Core\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// Rotas públicas de cadastro
Route::prefix('cadastro')->group(function () {
    Route::get('verificar-slug/{slug}', [CadastroController::class, 'verificarSlug']);
    Route::post('iniciar', [CadastroController::class, 'iniciar']);
});

// Webhook do Mercado Pago — sem autenticação, validação por assinatura
Route::post('webhooks/mercadopago', [WebhookController::class, 'mercadoPago'])
    ->withoutMiddleware(['auth']);
```

---

## Etapa 13 — Rodar as migrations da Fase 2

```bash
docker exec -it plataforma_backend php artisan migrate --force
```

---

## Etapa 14 — Configurar o worker de filas

No `docker-compose.yml`, adicione o serviço de queue worker:

```yaml
  queue_worker:
    build:
      context: ../backend
      dockerfile: ../infra/docker/backend.Dockerfile
    container_name: plataforma_queue
    restart: unless-stopped
    command: php artisan queue:work redis --sleep=3 --tries=3 --backoff=30
    volumes:
      - ../backend:/var/www/backend
    depends_on:
      - redis
      - banco
    networks:
      - rede_interna
```

**Por que um container separado para o worker?**
O queue worker precisa rodar continuamente em background. Colocá-lo no
mesmo container do backend PHP-FPM criaria conflito de processo. Um
container dedicado permite reiniciá-lo de forma independente e monitorar
seus logs separadamente.

---

## Checklist final da Fase 2

- [ ] SDK do Mercado Pago instalado
- [ ] Migrations de `faturas` e `cadastros_pendentes` criadas e executadas
- [ ] `CadastroDTO` criado
- [ ] `CadastroController` criado (verificarSlug + iniciar)
- [ ] `CadastroService` criado (slugDisponivel + sugerirSlugs + iniciarCadastro)
- [ ] `MercadoPagoService` criado (criarPreferencia + validarWebhook)
- [ ] `WebhookController` criado com validação de assinatura
- [ ] `ProvisionarTenantJob` criado com retry e rollback
- [ ] `BotPoolService` criado com lock pessimista
- [ ] `EmailService` criado (boas-vindas + aviso vencimento + suspensão)
- [ ] Command `SuspenderTenantVencido` criado e agendado
- [ ] Rotas de cadastro e webhook criadas
- [ ] Container `queue_worker` adicionado ao docker-compose
- [ ] Fluxo testado end-to-end em ambiente de sandbox do MP
- [ ] Email de boas-vindas chegando corretamente

**Fase 2 concluída → partir para a Fase 3 (Agente Telegram)**
