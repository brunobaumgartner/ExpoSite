# Plataforma SaaS — Fase 1: Fundação

## Objetivo
Ter a estrutura base do projeto funcionando localmente via Docker, com Laravel
configurado, padrão de camadas definido (Controller/Service/Repository/DTO),
multi-tenancy com schema por tenant e autenticação pronta. Nenhuma feature de
produto ainda — apenas a fundação sobre a qual tudo será construído.

## Stack desta fase
| Tecnologia | Papel |
|---|---|
| Laravel 11 | Backend central, API e painéis |
| MySQL 8 | Banco central + schemas por tenant |
| Redis | Cache e filas |
| Nginx | Reverse proxy e roteamento |
| Docker Compose | Orquestração local |
| Node.js + Claude Code | Ferramenta de desenvolvimento |

## Estrutura de repositórios
```
/srv/plataforma/
  backend/          — Laravel 11
  agente/           — Worker Python (Fase 3)
  templates/        — Sites Next.js (Fase 4)
  infra/            — Docker Compose + Nginx
  docs/             — Documentação geral
```

---

## Etapa 1 — Criar estrutura de diretórios

```bash
mkdir -p /srv/plataforma
cd /srv/plataforma

mkdir -p \
  backend \
  agente \
  templates/landing-page \
  templates/institucional \
  templates/ecommerce \
  templates/cardapio \
  templates/agendamento \
  infra/nginx \
  docs
```

**Por que essa estrutura?**
Separar backend, agente e templates em diretórios independentes garante que
cada parte possa evoluir e ser deployada de forma isolada. Quando o projeto
crescer, cada diretório pode virar seu próprio repositório sem refatoração.

---

## Etapa 2 — Criar o .gitignore raiz

Crie `/srv/plataforma/.gitignore`:

```gitignore
# Variáveis de ambiente — NUNCA versionar
.env
*.env.local

# Laravel
backend/vendor/
backend/node_modules/
backend/.env
backend/storage/logs/
backend/bootstrap/cache/

# Python
agente/__pycache__/
agente/*.pyc
agente/.venv/
agente/venv/

# Next.js
templates/*/.next/
templates/*/node_modules/
templates/*/.env.local

# Docker volumes locais
infra/volumes/

# Sistema operacional
.DS_Store
Thumbs.db

# Claude Code
.claude/
```

---

## Etapa 3 — Criar o docker-compose.yml

Crie `/srv/plataforma/infra/docker-compose.yml`:

```yaml
# ================================================================
# Plataforma SaaS — Docker Compose (desenvolvimento local)
# Sobe: Laravel, MySQL, Redis e Nginx
# ================================================================

services:

  nginx:
    image: nginx:alpine
    container_name: plataforma_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ../backend:/var/www/backend:ro
      - dados_ssl:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - rede_interna

  backend:
    build:
      context: ../backend
      dockerfile: ../infra/docker/backend.Dockerfile
    container_name: plataforma_backend
    restart: unless-stopped
    environment:
      APP_ENV: local
    volumes:
      - ../backend:/var/www/backend
    depends_on:
      banco:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - rede_interna

  banco:
    image: mysql:8.0
    container_name: plataforma_banco
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${BD_SENHA_ROOT}
      MYSQL_DATABASE: plataforma
      MYSQL_USER: ${BD_USUARIO}
      MYSQL_PASSWORD: ${BD_SENHA}
    volumes:
      - dados_banco:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - rede_interna

  redis:
    image: redis:alpine
    container_name: plataforma_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_SENHA}
    volumes:
      - dados_redis:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - rede_interna

networks:
  rede_interna:
    driver: bridge

volumes:
  dados_banco:
  dados_redis:
  dados_ssl:
```

**Por que rede interna?**
Os containers se comunicam pela rede Docker interna (`rede_interna`) e não
pelo localhost. Isso significa que o backend acessa o banco pelo hostname
`banco` (não `127.0.0.1`), e o Redis pelo hostname `redis`. Nenhuma porta
de serviço interno precisa estar exposta para fora do Docker — só o Nginx
fica exposto nas portas 80 e 443.

---

## Etapa 4 — Criar o Dockerfile do backend

Crie `/srv/plataforma/infra/docker/backend.Dockerfile`:

```dockerfile
FROM php:8.3-fpm-alpine

# Extensões PHP necessárias
RUN docker-php-ext-install pdo pdo_mysql opcache pcntl

# Redis para PHP
RUN apk add --no-cache $PHPIZE_DEPS \
  && pecl install redis \
  && docker-php-ext-enable redis

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Permissões corretas para o Laravel
RUN chown -R www-data:www-data /var/www/backend
```

**Por que Alpine?**
A imagem Alpine é muito menor que a Debian (cerca de 5x menor), reduzindo
o tempo de build e o uso de disco. As extensões PHP necessárias para o
Laravel (pdo, pdo_mysql, opcache, pcntl) são instaladas explicitamente —
sem pacotes desnecessários.

---

## Etapa 5 — Criar o .env.exemplo raiz

Crie `/srv/plataforma/.env.exemplo`:

```env
# ================================================================
# Plataforma SaaS — Arquivo de configuração de ambiente
# Copie: cp .env.exemplo .env
# Preencha os valores reais no .env — nunca commite o .env
# ================================================================

# Banco de dados central
BD_SENHA_ROOT=senha_root_aqui
BD_USUARIO=plataforma_usuario
BD_SENHA=senha_forte_aqui

# Redis
REDIS_SENHA=senha_redis_aqui

# Laravel
APP_CHAVE=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
APP_URL=http://localhost

# Mercado Pago (Fase 2)
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=

# Telegram (Fase 3)
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# OpenAI — GPT-4o mini (Fase 3)
OPENAI_CHAVE=

# Email transacional (Fase 2)
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=noreply@suaplataforma.com.br

# Ambiente
APP_ENV=local
APP_DEBUG=true
```

---

## Etapa 6 — Instalar o Laravel

```bash
cd /srv/plataforma/backend

# Instala o Laravel 11 via Composer
composer create-project laravel/laravel . "^11.0"

# Verifica
php artisan --version
```

---

## Etapa 7 — Criar a estrutura de módulos

```bash
cd /srv/plataforma/backend

mkdir -p app/Modules/Core
mkdir -p app/Modules/Site
mkdir -p app/Modules/Ecommerce
mkdir -p app/Modules/Agendamento
mkdir -p app/Modules/Cardapio

# Dentro de cada módulo, a mesma estrutura de camadas
for modulo in Core Site Ecommerce Agendamento Cardapio; do
  mkdir -p app/Modules/$modulo/Controllers
  mkdir -p app/Modules/$modulo/Services
  mkdir -p app/Modules/$modulo/Repositories
  mkdir -p app/Modules/$modulo/DTOs
  mkdir -p app/Modules/$modulo/Models
  mkdir -p app/Modules/$modulo/Policies
  mkdir -p app/Modules/$modulo/routes
  mkdir -p database/migrations/$modulo
done
```

**Por que módulos?**
O padrão de módulos isola cada domínio do sistema (Core, Ecommerce,
Agendamento etc.) em seu próprio namespace. Isso aplica o princípio
Open/Closed do SOLID — um novo módulo (como Financeiro no futuro) entra
sem tocar no código existente. Cada módulo tem suas próprias rotas,
controllers, services, repositories, DTOs, models e policies.

---

## Etapa 8 — Criar as interfaces base (SOLID)

Crie `/srv/plataforma/backend/app/Interfaces/RepositorioLeituraInterface.php`:

```php
<?php

namespace App\Interfaces;

interface RepositorioLeituraInterface
{
    /**
     * Busca um registro pelo ID dentro do tenant atual.
     */
    public function buscarPorId(int $id): ?object;

    /**
     * Retorna todos os registros do tenant atual.
     */
    public function listarTodos(array $filtros = []): array;
}
```

Crie `/srv/plataforma/backend/app/Interfaces/RepositorioEscritaInterface.php`:

```php
<?php

namespace App\Interfaces;

interface RepositorioEscritaInterface
{
    /**
     * Persiste um novo registro no banco.
     */
    public function criar(array $dados): object;

    /**
     * Atualiza um registro existente pelo ID.
     */
    public function atualizar(int $id, array $dados): object;

    /**
     * Remove um registro pelo ID (soft delete).
     */
    public function remover(int $id): bool;
}
```

Crie `/srv/plataforma/backend/app/Interfaces/RepositorioInterface.php`:

```php
<?php

namespace App\Interfaces;

interface RepositorioInterface extends RepositorioLeituraInterface, RepositorioEscritaInterface
{
}
```

**Por que interfaces separadas?**
Aplicando o Interface Segregation Principle (ISP) do SOLID: um módulo que
só precisa ler dados (como um relatório) implementa apenas
`RepositorioLeituraInterface`, sem ser obrigado a implementar métodos de
escrita que nunca vai usar. Módulos completos implementam
`RepositorioInterface`, que une as duas.

---

## Etapa 9 — Criar o ServiceProvider de módulos

Crie `/srv/plataforma/backend/app/Providers/ModulosServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModulosServiceProvider extends ServiceProvider
{
    /**
     * Registra todos os módulos ativos e suas rotas.
     */
    public function register(): void
    {
        $modulos = ['Core', 'Site', 'Ecommerce', 'Agendamento', 'Cardapio'];

        foreach ($modulos as $modulo) {
            $this->mergeConfigFrom(
                app_path("Modules/{$modulo}/config.php"),
                strtolower($modulo)
            );
        }
    }

    /**
     * Carrega as rotas de todos os módulos registrados.
     */
    public function boot(): void
    {
        $modulos = ['Core', 'Site', 'Ecommerce', 'Agendamento', 'Cardapio'];

        foreach ($modulos as $modulo) {
            $arquivo = app_path("Modules/{$modulo}/routes/api.php");

            if (file_exists($arquivo)) {
                $this->loadRoutesFrom($arquivo);
            }
        }
    }
}
```

---

## Etapa 10 — Criar o middleware de tenant

Crie `/srv/plataforma/backend/app/Http/Middleware/IdentificarTenant.php`:

```php
<?php

namespace App\Http\Middleware;

use App\Modules\Core\Services\TenantService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentificarTenant
{
    public function __construct(
        private readonly TenantService $tenantService
    ) {}

    /**
     * Identifica o tenant pelo subdomínio da requisição e configura
     * a conexão com o schema correto antes de qualquer ação.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $subdominio = $this->extrairSubdominio($request->getHost());

        $tenant = $this->tenantService->buscarPorSubdominio($subdominio);

        if (!$tenant) {
            abort(404, 'Tenant não encontrado.');
        }

        if (!$tenant->estaAtivo()) {
            abort(403, 'Esta conta está suspensa.');
        }

        $this->tenantService->configurarConexao($tenant);

        $request->merge(['tenant' => $tenant]);

        return $next($request);
    }

    /**
     * Extrai o subdomínio a partir do host completo.
     * Ex: "barbearia-joao.suaplataforma.com.br" → "barbearia-joao"
     */
    private function extrairSubdominio(string $host): string
    {
        $partes = explode('.', $host);
        return $partes[0];
    }
}
```

**Por que identificar pelo subdomínio?**
Cada tenant tem seu próprio subdomínio (`slug.suaplataforma.com.br`). O
middleware intercepta toda requisição, extrai o subdomínio, busca o tenant
correspondente no banco central e configura a conexão para o schema daquele
tenant. Isso garante que nenhuma ação seja executada sem que o tenant esteja
identificado e ativo — é a primeira camada de isolamento entre tenants.

---

## Etapa 11 — Criar o TenantService base

Crie `/srv/plataforma/backend/app/Modules/Core/Services/TenantService.php`:

```php
<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Tenant;
use Illuminate\Support\Facades\DB;

class TenantService
{
    /**
     * Busca um tenant pelo subdomínio no banco central.
     */
    public function buscarPorSubdominio(string $subdominio): ?Tenant
    {
        return Tenant::where('subdominio', $subdominio)->first();
    }

    /**
     * Configura a conexão do Laravel para usar o schema do tenant.
     * Todas as queries subsequentes na conexão "tenant" apontarão
     * para o banco isolado daquele cliente.
     */
    public function configurarConexao(Tenant $tenant): void
    {
        config([
            'database.connections.tenant.database' => "tenant_{$tenant->slug}",
        ]);

        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    /**
     * Cria o schema do tenant e roda as migrations do módulo escolhido.
     */
    public function provisionar(Tenant $tenant, array $modulos): void
    {
        DB::statement("CREATE DATABASE IF NOT EXISTS `tenant_{$tenant->slug}`
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        $this->configurarConexao($tenant);

        foreach ($modulos as $modulo) {
            $this->rodarMigrations($modulo);
        }
    }

    /**
     * Remove o schema do tenant permanentemente (direito ao esquecimento LGPD).
     */
    public function removerSchema(Tenant $tenant): void
    {
        DB::statement("DROP DATABASE IF EXISTS `tenant_{$tenant->slug}`");
    }

    /**
     * Executa as migrations de um módulo específico no schema do tenant ativo.
     */
    private function rodarMigrations(string $modulo): void
    {
        \Artisan::call('migrate', [
            '--path'     => "database/migrations/{$modulo}",
            '--database' => 'tenant',
            '--force'    => true,
        ]);
    }
}
```

---

## Etapa 12 — Criar o Model Tenant

Crie `/srv/plataforma/backend/app/Modules/Core/Models/Tenant.php`:

```php
<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    protected $table = 'tenants';

    protected $fillable = [
        'slug',
        'subdominio',
        'plano_id',
        'status',
    ];

    protected $casts = [
        'criado_em'     => 'datetime',
        'suspenso_em'   => 'datetime',
        'deleted_at'    => 'datetime',
    ];

    /**
     * Verifica se o tenant está ativo e pode usar a plataforma.
     */
    public function estaAtivo(): bool
    {
        return $this->status === 'ativo';
    }

    /**
     * Retorna o nome do schema MySQL deste tenant.
     */
    public function nomeSchema(): string
    {
        return "tenant_{$this->slug}";
    }
}
```

---

## Etapa 13 — Criar as migrations do banco central

Crie `/srv/plataforma/backend/database/migrations/2024_01_01_000001_criar_tabela_planos.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->json('modulos');
            $table->unsignedInteger('limite_mensagens')->nullable();
            $table->unsignedInteger('limite_produtos')->nullable();
            $table->unsignedInteger('limite_agendamentos')->nullable();
            $table->decimal('preco_mensal', 10, 2);
            $table->decimal('preco_anual', 10, 2);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planos');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/2024_01_01_000002_criar_tabela_tenants.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_id')->constrained('planos');
            $table->string('slug', 100)->unique();
            $table->string('subdominio', 150)->unique();
            $table->enum('status', ['ativo', 'suspenso', 'cancelado'])->default('ativo');
            $table->timestamp('suspenso_em')->nullable();
            $table->timestamp('cancela_em')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/2024_01_01_000003_criar_tabela_tenant_configs.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('chave', 100);
            $table->text('valor')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'chave']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_configs');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/2024_01_01_000004_criar_tabela_bot_pool.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bot_pool', function (Blueprint $table) {
            $table->id();
            $table->text('token');
            $table->string('username', 100)->nullable();
            $table->enum('status', ['disponivel', 'em_uso'])->default('disponivel');
            $table->foreignId('tenant_id')
                  ->nullable()
                  ->constrained('tenants')
                  ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bot_pool');
    }
};
```

**Por que `token` é `text` e não `string`?**
Tokens do Telegram têm formato `123456789:AABBccDDee...` com comprimento
variável. Usar `text` evita truncamento silencioso que poderia invalidar
o token sem erro aparente.

---

## Etapa 14 — Criar as migrations do schema tenant (Core)

Crie `/srv/plataforma/backend/database/migrations/Core/2024_01_01_000001_criar_tabela_usuarios.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->string('email', 150)->unique();
            $table->string('senha');
            $table->string('telegram_chat_id', 50)->nullable()->unique();
            $table->string('telefone', 30)->nullable();
            $table->enum('perfil', ['admin', 'editor'])->default('admin');
            $table->string('codigo_2fa', 6)->nullable();
            $table->timestamp('codigo_2fa_expira_em')->nullable();
            $table->boolean('2fa_ativo')->default(false);
            $table->timestamp('ultimo_acesso_em')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('usuarios');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/Core/2024_01_01_000002_criar_tabela_auditoria.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable();
            $table->string('acao', 100);
            $table->json('payload')->nullable();
            $table->json('resultado')->nullable();
            $table->enum('origem', ['agente', 'painel', 'sistema']);
            $table->string('ip', 45)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('auditoria');
    }
};
```

Crie `/srv/plataforma/backend/database/migrations/Core/2024_01_01_000003_criar_tabela_site_versoes.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('site_versoes', function (Blueprint $table) {
            $table->id();
            $table->json('config_snapshot');
            $table->string('commit_hash', 64)->nullable();
            $table->string('mensagem', 255)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('site_versoes');
    }
};
```

---

## Etapa 15 — Configurar autenticação

```bash
cd /srv/plataforma/backend

# Instala Sanctum para autenticação via token
composer require laravel/sanctum

php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

**Por que Sanctum?**
O Sanctum é o pacote oficial do Laravel para autenticação de SPA e API via
tokens. É mais leve que o Passport (que usa OAuth2 completo) e suficiente
para nosso caso — autenticar o painel do cliente e as chamadas do agente
Python para a API.

---

## Etapa 16 — Subir os containers

```bash
cd /srv/plataforma/infra

# Copia e preenche o .env
cp ../.env.exemplo ../.env
nano ../.env

# Sobe os containers
docker compose up -d

# Verifica status
docker compose ps

# Acompanha logs
docker compose logs -f backend
```

---

## Etapa 17 — Rodar as migrations do banco central

```bash
docker exec -it plataforma_backend php artisan migrate --force
```

Resultado esperado:
```
Migrating: 2024_01_01_000001_criar_tabela_planos
Migrated:  2024_01_01_000001_criar_tabela_planos
Migrating: 2024_01_01_000002_criar_tabela_tenants
Migrated:  2024_01_01_000002_criar_tabela_tenants
Migrating: 2024_01_01_000003_criar_tabela_tenant_configs
Migrated:  2024_01_01_000003_criar_tabela_tenant_configs
Migrating: 2024_01_01_000004_criar_tabela_bot_pool
Migrated:  2024_01_01_000004_criar_tabela_bot_pool
```

---

## Etapa 18 — Configurar Git e primeiro commit

```bash
cd /srv/plataforma

git init
git config user.name "Seu Nome"
git config user.email "seu@email.com"
git config init.defaultBranch main

git add .
git commit -m "feat: inicializa estrutura base da plataforma"
```

---

## Etapa 19 — Gerar documentação base

Crie `/srv/plataforma/docs/ARCHITECTURE.md`:

```markdown
# Arquitetura da Plataforma

## Visão geral
Plataforma SaaS multi-tenant para criação e gestão de sites por voz/texto
via Telegram. Cada cliente (tenant) tem seu próprio subdomínio, agente
Telegram e schema de banco de dados isolado.

## Stack
- **Backend:** Laravel 11 + MySQL 8 + Redis
- **Agente:** Python + Whisper local + GPT-4o mini
- **Frontend sites:** Next.js (templates por tipo de site)
- **Painel:** Vue 3 + Inertia (dentro do Laravel)
- **Infra:** Docker Compose + Nginx + Contabo VPS

## Multi-tenancy
Cada tenant tem um schema MySQL próprio (`tenant_{slug}`).
O middleware `IdentificarTenant` detecta o tenant pelo subdomínio e
configura a conexão antes de qualquer query.

## Módulos
- **Core** — tenant, auth, billing, auditoria
- **Site** — templates, config, versionamento
- **Ecommerce** — produtos, categorias, pedidos
- **Agendamento** — serviços, agenda, horários
- **Cardapio** — herda Ecommerce com config diferente

## Padrão de camadas
Controller → Service → Repository → Model
DTOs trafegam entre todas as camadas.
```

Crie `/srv/plataforma/docs/DECISIONS.md`:

```markdown
# Decisões Arquiteturais

## 001 — Schema por tenant no MySQL
**Decisão:** cada tenant tem um schema MySQL próprio (`tenant_{slug}`).
**Motivo:** isolamento físico real entre tenants, sem risco de vazamento
de dados entre clientes. Facilita backup individual, exclusão LGPD e
futura migração para instância dedicada.
**Alternativa descartada:** tabelas compartilhadas com `tenant_id` —
maior risco de vazamento por bug de query.

## 002 — Bot Telegram centralizado com pool de tokens
**Decisão:** um único worker Python gerencia todos os bots via webhook
centralizado. Tokens pré-criados ficam em pool no banco central.
**Motivo:** custo de infra fixo independente do número de tenants.
Isolamento de segurança garantido por código (7 camadas de proteção).
**Alternativa descartada:** processo Python por tenant — custo cresce
linearmente com clientes.

## 003 — GPT-4o mini como LLM
**Decisão:** GPT-4o mini para interpretação de intenções do agente.
**Motivo:** custo ~$0.001 por mensagem, qualidade suficiente para
interpretação de comandos em português. Whisper roda local (gratuito).
**Alternativa futura:** Llama 3 local via Ollama para zerar custo de LLM
quando o volume justificar o hardware.

## 004 — SOLID como padrão de design
**Decisão:** arquitetura em módulos com Controller/Service/Repository/DTO
e interfaces base para repositórios.
**Motivo:** permite adicionar novos módulos (Financeiro, Blog, PDV) sem
modificar código existente. Facilita testes unitários e manutenção.
```

---

## Checklist final da Fase 1

- [ ] Estrutura de diretórios criada em `/srv/plataforma`
- [ ] `.gitignore` criado
- [ ] `.env.exemplo` criado e commitado
- [ ] `.env` criado e preenchido com valores reais
- [ ] `docker-compose.yml` criado
- [ ] `backend.Dockerfile` criado
- [ ] Laravel 11 instalado
- [ ] Estrutura de módulos criada (`app/Modules/`)
- [ ] Interfaces base criadas (`RepositorioInterface`)
- [ ] `ModulosServiceProvider` criado e registrado
- [ ] Middleware `IdentificarTenant` criado
- [ ] `TenantService` criado com provisionar/remover schema
- [ ] Model `Tenant` criado
- [ ] Migrations do banco central criadas (planos, tenants, tenant_configs, bot_pool)
- [ ] Migrations do Core do tenant criadas (usuarios, auditoria, site_versoes)
- [ ] Sanctum instalado e configurado
- [ ] Containers Docker rodando sem erros
- [ ] Migrations do banco central executadas com sucesso
- [ ] `ARCHITECTURE.md` criado
- [ ] `DECISIONS.md` criado com decisões 001 a 004
- [ ] Primeiro commit feito

**Fase 1 concluída → partir para a Fase 2 (Pagamento e Onboarding)**
