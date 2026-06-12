@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ExpoSite — Criando estrutura de pastas
echo ========================================
echo.
echo Criando estrutura no diretorio atual...
echo.

:: Backend Laravel
mkdir backend\app\Modules\Core\Controllers\Admin
mkdir backend\app\Modules\Core\Controllers\Painel
mkdir backend\app\Modules\Core\DTOs
mkdir backend\app\Modules\Core\Jobs
mkdir backend\app\Modules\Core\Models
mkdir backend\app\Modules\Core\Policies
mkdir backend\app\Modules\Core\Repositories
mkdir backend\app\Modules\Core\Services
mkdir backend\app\Modules\Core\routes
mkdir backend\app\Modules\Site\Controllers\Painel
mkdir backend\app\Modules\Site\DTOs
mkdir backend\app\Modules\Site\Jobs
mkdir backend\app\Modules\Site\Models
mkdir backend\app\Modules\Site\Policies
mkdir backend\app\Modules\Site\Repositories
mkdir backend\app\Modules\Site\Services
mkdir backend\app\Modules\Site\routes
mkdir backend\app\Modules\Ecommerce\Controllers\Painel
mkdir backend\app\Modules\Ecommerce\DTOs
mkdir backend\app\Modules\Ecommerce\Jobs
mkdir backend\app\Modules\Ecommerce\Models
mkdir backend\app\Modules\Ecommerce\Policies
mkdir backend\app\Modules\Ecommerce\Repositories
mkdir backend\app\Modules\Ecommerce\Services
mkdir backend\app\Modules\Ecommerce\routes
mkdir backend\app\Modules\Agendamento\Controllers\Painel
mkdir backend\app\Modules\Agendamento\DTOs
mkdir backend\app\Modules\Agendamento\Jobs
mkdir backend\app\Modules\Agendamento\Models
mkdir backend\app\Modules\Agendamento\Policies
mkdir backend\app\Modules\Agendamento\Repositories
mkdir backend\app\Modules\Agendamento\Services
mkdir backend\app\Modules\Agendamento\routes
mkdir backend\app\Modules\Cardapio\Controllers\Painel
mkdir backend\app\Modules\Cardapio\DTOs
mkdir backend\app\Modules\Cardapio\Jobs
mkdir backend\app\Modules\Cardapio\Models
mkdir backend\app\Modules\Cardapio\Policies
mkdir backend\app\Modules\Cardapio\Repositories
mkdir backend\app\Modules\Cardapio\Services
mkdir backend\app\Modules\Cardapio\routes
mkdir backend\app\Interfaces
mkdir backend\app\Http\Middleware
mkdir backend\app\Console\Commands
mkdir backend\app\Providers
mkdir backend\database\migrations\Core
mkdir backend\database\migrations\Site
mkdir backend\database\migrations\Ecommerce
mkdir backend\database\migrations\Agendamento
mkdir backend\database\migrations\Cardapio
mkdir backend\resources\views\emails
mkdir backend\resources\js\Pages\Admin\Tenants
mkdir backend\resources\js\Pages\Admin\Planos
mkdir backend\resources\js\Pages\Admin\BotPool
mkdir backend\resources\js\Pages\Painel\Site
mkdir backend\resources\js\Pages\Painel\Produtos
mkdir backend\resources\js\Pages\Painel\Categorias
mkdir backend\resources\js\Pages\Painel\Agendamentos
mkdir backend\resources\js\Pages\Painel\Conta
mkdir backend\resources\js\Components

:: Agente Python
mkdir agente\nucleo
mkdir agente\intencoes\core
mkdir agente\intencoes\site
mkdir agente\intencoes\ecommerce
mkdir agente\intencoes\agendamento
mkdir agente\modelos
mkdir agente\utilitarios

:: Templates Next.js
mkdir templates\landing-page\components
mkdir templates\landing-page\pages
mkdir templates\landing-page\public
mkdir templates\institucional\components
mkdir templates\institucional\pages
mkdir templates\institucional\public
mkdir templates\ecommerce\components
mkdir templates\ecommerce\pages
mkdir templates\ecommerce\public
mkdir templates\cardapio\components
mkdir templates\cardapio\pages
mkdir templates\cardapio\public
mkdir templates\agendamento\components
mkdir templates\agendamento\pages
mkdir templates\agendamento\public

:: Infra
mkdir infra\docker
mkdir infra\nginx\conf.d
mkdir infra\scripts

:: Docs
mkdir docs

:: Sites dos clientes (gerados em runtime)
mkdir sites

:: Backups (gerados em runtime)
mkdir backups

:: Arquivos raiz vazios
type nul > .env.exemplo
type nul > .gitignore
type nul > CLAUDE.md
type nul > README.md

echo.
echo ========================================
echo   Estrutura criada com sucesso!
echo ========================================
echo.
echo Proximos passos:
echo   1. Cole o conteudo nos arquivos CLAUDE.md e README.md
echo   2. Preencha o .env.exemplo
echo   3. Preencha o .gitignore
echo   4. Abra no VS Code: code .
echo   5. Inicie o Claude CLI: claude
echo.
pause
