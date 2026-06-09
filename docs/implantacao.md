# ExpoSite — Guia de Implantação

## Infraestrutura atual

| Item | Valor |
|---|---|
| Provedor | Contabo |
| Plano | Cloud VPS 10 SSD |
| Sistema | Ubuntu 24.04 LTS |
| IP Público | 144.91.70.44 |
| SSH porta padrão | 22 (porta 443 usada pelo sshd nesta VPS) |
| Domínio | exposite.com.br |
| Repositório | github.com/brunobaumgartner/ExpoSite |
| Diretório do projeto | /srv/exposite |

## Acesso SSH

```bash
ssh root@144.91.70.44

# Se a porta 22 não responder, usar:
ssh root@144.91.70.44 -p 443
```

> Se aparecer "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED", limpe o registro antigo:
> ```bash
> ssh-keygen -R 144.91.70.44
> ```

---

## Serviços acessíveis (Fase 1)

| URL | Serviço |
|---|---|
| `http://144.91.70.44/api/ping` | Health check da API → `{"status":"ok"}` |
| `http://144.91.70.44/up` | Health check do Laravel → `200 OK` |
| `http://144.91.70.44:3001` | Uptime Kuma — monitoramento |

HTTPS e domínio próprio serão configurados na Fase 7.

---

## Etapa 1 — Pré-requisitos na VPS

O servidor já vem com Git, Docker, Docker Compose e Node.js instalados.
Verificar:

```bash
git --version
docker --version
docker compose version
node --version
```

Se algum faltar:
```bash
# Docker
curl -fsSL https://get.docker.com | sh

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

---

## Etapa 2 — Clonar o repositório

```bash
mkdir -p /srv/exposite
git clone https://github.com/brunobaumgartner/ExpoSite.git /srv/exposite
cd /srv/exposite
ls -la
```

---

## Etapa 3 — Configurar o .env raiz

```bash
cd /srv/exposite
cp .env.exemplo .env
nano .env
```

Gerar senhas aleatórias:
```bash
openssl rand -hex 16   # para BD_SENHA_ROOT, BD_SENHA, REDIS_SENHA
openssl rand -hex 32   # para API_TOKEN_INTERNO
```

Preencher no `.env`:
```env
BD_SENHA_ROOT=<senha gerada>
BD_USUARIO=exposite_usuario
BD_SENHA=<senha gerada>
REDIS_SENHA=<senha gerada>

APP_KEY=                  # gerado na Etapa 5
APP_URL=http://144.91.70.44
APP_DOMINIO=exposite.com.br
APP_ENV=local
APP_DEBUG=true

API_TOKEN_INTERNO=<token gerado>
```

> O `.env` raiz controla as variáveis dos containers Docker.
> O `backend/.env` (criado na Etapa 5) é o arquivo lido pelo Laravel.

---

## Etapa 4 — Subir os containers

> **Importante:** sempre usar `--env-file .env` ao rodar o Docker Compose com
> `-f infra/docker-compose.yml`. Sem ele, o Docker Compose não encontra o `.env`
> (procura no diretório do arquivo compose, não na raiz do projeto).

```bash
cd /srv/exposite

# Subir todos os containers (exceto agente — disponível na Fase 3)
docker compose -f infra/docker-compose.yml --env-file .env up -d \
  nginx banco redis backend queue monitoramento

# Acompanhar logs
docker compose -f infra/docker-compose.yml --env-file .env logs -f

# Verificar status
docker compose -f infra/docker-compose.yml --env-file .env ps
```

Status esperado após ~1 minuto (banco e redis levam alguns segundos para ficarem healthy):
```
NAME                     STATUS
exposite_backend         Up
exposite_banco           Up (healthy)
exposite_monitoramento   Up (healthy)
exposite_nginx           Up
exposite_queue           Up
exposite_redis           Up (healthy)
```

> Se o `queue` ficar em "Restarting", é normal — ele aguarda o `composer install`
> da Etapa 5.

---

## Etapa 5 — Configurar o backend Laravel

### 5.1 Criar diretórios de permissão

```bash
mkdir -p /srv/exposite/backend/bootstrap/cache
mkdir -p /srv/exposite/backend/storage/framework/{cache,sessions,testing,views}
mkdir -p /srv/exposite/backend/storage/logs
mkdir -p /srv/exposite/backend/storage/app/public
chmod -R 775 /srv/exposite/backend/bootstrap/cache /srv/exposite/backend/storage
chown -R 33:33 /srv/exposite/backend/bootstrap/cache /srv/exposite/backend/storage
```

### 5.2 Criar o backend/.env

O `backend/.env` é o arquivo lido pelo Laravel dentro do container.
Rode o script abaixo a partir da raiz do projeto:

```bash
cd /srv/exposite
export $(grep -v "^#" .env | grep -v "^$" | xargs)

cat > backend/.env << EOF
APP_NAME=ExpoSite
APP_ENV=${APP_ENV:-local}
APP_KEY=
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL:-http://144.91.70.44}
APP_TIMEZONE=America/Sao_Paulo
APP_LOCALE=pt_BR

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PASSWORD=${REDIS_SENHA}
REDIS_PORT=6379

BD_HOST=banco
BD_PORTA=3306
BD_USUARIO=${BD_USUARIO}
BD_SENHA=${BD_SENHA}

API_TOKEN_INTERNO=${API_TOKEN_INTERNO}
APP_DOMINIO=${APP_DOMINIO:-exposite.com.br}
EOF
```

### 5.3 Instalar dependências e gerar APP_KEY

```bash
# Instalar Composer
docker exec exposite_backend composer install --no-dev --optimize-autoloader --no-interaction

# Gerar APP_KEY (salva automaticamente em backend/.env)
docker exec exposite_backend php artisan key:generate --force

# Otimizar
docker exec exposite_backend php artisan optimize
```

### 5.4 Reiniciar o queue worker

```bash
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env restart queue
```

---

## Etapa 6 — Rodar as migrations

```bash
docker exec exposite_backend php artisan migrate --force
```

Resultado esperado:
```
0001_01_01_000000_create_users_table .................. DONE
0001_01_01_000001_create_cache_table .................. DONE
0001_01_01_000002_create_jobs_table ................... DONE
2024_01_01_000001_criar_tabela_planos ................. DONE
2024_01_01_000002_criar_tabela_clientes ............... DONE
2024_01_01_000003_criar_tabela_cliente_configs ........ DONE
2024_01_01_000004_criar_tabela_bot_pool ............... DONE
2024_01_01_000005_criar_tabela_faturas ................ DONE
2024_01_01_000006_criar_tabela_cadastros_pendentes .... DONE
2024_01_01_000007_criar_tabela_admins ................. DONE
```

---

## Etapa 7 — Criar os planos iniciais

```bash
docker exec -it exposite_backend php artisan tinker
```

```php
App\Modules\Core\Models\Plano::insert([
    [
        'nome'                => 'Básico',
        'modulos'             => json_encode(['core', 'site']),
        'limite_mensagens'    => 50,
        'limite_produtos'     => null,
        'limite_agendamentos' => null,
        'preco_mensal'        => 97.00,
        'preco_anual'         => 970.00,
        'ativo'               => true,
        'created_at'          => now(),
        'updated_at'          => now(),
    ],
    [
        'nome'                => 'Pro',
        'modulos'             => json_encode(['core', 'site', 'ecommerce', 'agendamento']),
        'limite_mensagens'    => 200,
        'limite_produtos'     => 100,
        'limite_agendamentos' => 100,
        'preco_mensal'        => 197.00,
        'preco_anual'         => 1970.00,
        'ativo'               => true,
        'created_at'          => now(),
        'updated_at'          => now(),
    ],
    [
        'nome'                => 'Business',
        'modulos'             => json_encode(['core', 'site', 'ecommerce', 'agendamento', 'cardapio']),
        'limite_mensagens'    => 1000,
        'limite_produtos'     => null,
        'limite_agendamentos' => null,
        'preco_mensal'        => 597.00,
        'preco_anual'         => 5970.00,
        'ativo'               => true,
        'created_at'          => now(),
        'updated_at'          => now(),
    ],
]);
exit
```

---

## Etapa 8 — Criar o primeiro admin

```bash
docker exec -it exposite_backend php artisan tinker
```

```php
App\Modules\Core\Models\Admin::create([
    'nome'  => 'Bruno Baumgartner',
    'email' => 'brunobaumgartner@hotmail.com',
    'senha' => Illuminate\Support\Facades\Hash::make('sua_senha_aqui'),
]);
exit
```

---

## Procedimentos operacionais

### Atualizar o código em produção

```bash
cd /srv/exposite
git pull origin main
docker compose -f infra/docker-compose.yml --env-file .env build backend queue
docker compose -f infra/docker-compose.yml --env-file .env up -d
docker exec exposite_backend php artisan migrate --force
docker exec exposite_backend php artisan optimize:clear
docker exec exposite_backend php artisan optimize
```

### Reiniciar um serviço

```bash
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env restart backend
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env restart queue
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env restart nginx
```

### Ver logs em tempo real

```bash
# Todos os serviços
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env logs -f

# Serviço específico
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env logs -f backend
docker compose -f /srv/exposite/infra/docker-compose.yml --env-file /srv/exposite/.env logs -f queue
```

### Suspender um cliente manualmente

```bash
docker exec -it exposite_backend php artisan tinker

App\Modules\Core\Models\Cliente::where('slug', 'slug-do-cliente')
    ->update(['status' => 'suspenso', 'suspenso_em' => now()]);
exit
```

### Backup manual do banco

```bash
/srv/exposite/infra/scripts/backup.sh
```

---

## Notas de implantação (aprendizados)

| Problema | Causa | Solução |
|---|---|---|
| `docker compose` não lê variáveis | Docker Compose v5 procura `.env` no dir do compose file | Sempre usar `--env-file .env` |
| Redis unhealthy | `redis-cli ping` falha quando auth está ativo | Healthcheck com `CMD-SHELL` + senha |
| Redis 8 não inicia | Redis 8.x carrega módulos e quebra `--requirepass` na CLI | Pinado em `redis:7-alpine` |
| Porta 443 ocupada | sshd desta VPS escuta na porta 443 | Nginx usa apenas porta 80 nas Fases 1-6 |
| Composer install falha | `symfony/clock v8.1.0` exige PHP ≥ 8.4.1 | Dockerfile atualizado para PHP 8.4 |
| `bootstrap/cache` não existe | Git não versiona diretórios vazios | Criar manualmente antes do `composer install` |
| `backend/.env` ausente | Gitignored — não vai no repo | Criar com script na Etapa 5.2 |

---

## Checklist da Fase 1

- [x] VPS acessível via SSH
- [x] Repositório clonado em `/srv/exposite`
- [x] `.env` raiz criado e preenchido
- [x] `backend/.env` criado com variáveis do Laravel
- [x] Containers rodando: banco, redis, backend, nginx, queue, monitoramento
- [x] `composer install` executado
- [x] `APP_KEY` gerada
- [x] Migrations rodadas (10 tabelas)
- [x] `GET /api/ping` → `{"status":"ok"}`
- [x] `GET /up` → `200 OK`
- [ ] Planos iniciais criados (Básico, Pro, Business)
- [ ] Primeiro admin criado
- [ ] Uptime Kuma configurado (`http://144.91.70.44:3001`)

**Próxima fase → Fase 2: Pagamento e Onboarding**
