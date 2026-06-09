# VozSite — Guia de Implantação

## Dados da infraestrutura
| Item | Valor |
|---|---|
| Provedor | Contabo |
| Sistema | Ubuntu 22.04 LTS |
| CPU | 4 vCPU |
| RAM | 8 GB |
| Disco | 150 GB SSD |
| IP Público | 123.456.789.000 |
| Domínio | vozsite.com.br |
| Repositório | github.com/seunome/vozsite |
| Diretório do projeto | /srv/vozsite |

## Como acessar a VPS
Via terminal:
```bash
ssh root@123.456.789.000
```

Via VS Code Remote SSH:
- `Ctrl+Shift+P` → `Remote-SSH: Connect to Host`
- `root@123.456.789.000`
- Abrir pasta `/srv/vozsite`

---

## Etapa 1 — Atualizar o sistema

```bash
apt update && apt upgrade -y
```

**Por que fazer isso primeiro?**
O Ubuntu recém instalado pode ter pacotes desatualizados com falhas de
segurança conhecidas. Atualizar antes de instalar qualquer coisa garante
uma base limpa e segura.

---

## Etapa 2 — Instalar dependências essenciais

```bash
apt install -y \
  git \
  curl \
  wget \
  unzip \
  nano \
  ufw \
  fail2ban \
  certbot \
  python3-certbot-nginx
```

**O que cada pacote faz:**
- `git` — clonar e atualizar o repositório
- `curl` / `wget` — download de scripts e arquivos
- `unzip` — descompactar arquivos
- `nano` — editor de texto no terminal
- `ufw` — firewall simples para controlar portas abertas
- `fail2ban` — bloqueia IPs com tentativas de força bruta
- `certbot` — gera e renova certificados SSL automaticamente
- `python3-certbot-nginx` — plugin do Certbot para Nginx

---

## Etapa 3 — Configurar o firewall

```bash
# Permite SSH — OBRIGATÓRIO antes de ativar o firewall
ufw allow 22

# HTTP e HTTPS — acesso público
ufw allow 80
ufw allow 443

# Ativa o firewall
ufw enable

# Verifica
ufw status
```

**Por que configurar antes de qualquer outra coisa?**
Por padrão o Ubuntu recém instalado tem todas as portas abertas. O firewall
garante que apenas as portas necessárias fiquem expostas. O `allow 22`
antes do `enable` é crítico — sem ele você perde o acesso SSH ao ativar.

---

## Etapa 4 — Configurar o fail2ban

```bash
systemctl enable fail2ban
systemctl start fail2ban
systemctl status fail2ban
```

**Por que o fail2ban?**
Qualquer servidor com IP público começa a receber tentativas de acesso por
força bruta em minutos. O fail2ban monitora as tentativas falhas de SSH e
bloqueia automaticamente o IP após 5 tentativas em 10 minutos.

---

## Etapa 5 — Hardening do SSH

```bash
# Desativa login por senha — apenas chave SSH permitida
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config

systemctl restart sshd
```

> ⚠️ Só execute isso se já tiver sua chave SSH configurada na VPS.
> Sem a chave, você perde o acesso permanentemente.

**Por que desativar login por senha?**
Com login apenas por chave SSH, ataques de força bruta se tornam impossíveis
por design — não há senha para tentar adivinhar.

---

## Etapa 6 — Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh

# Verifica
docker --version
docker compose version
```

**Por que Docker?**
Todos os serviços da plataforma (Laravel, MySQL, Redis, Nginx, agente Python)
rodam em containers isolados. Isso garante que o ambiente de produção é
idêntico ao de desenvolvimento e facilita atualizações e rollbacks sem
afetar o sistema operacional da VPS.

---

## Etapa 7 — Instalar Node.js e Claude Code

```bash
# Instala Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verifica
node --version
npm --version

# Instala o Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Verifica
claude --version
```

**Por que Node.js na VPS?**
O Claude Code roda em Node.js. Com ele instalado na VPS, você pode
desenvolver e executar comandos diretamente pelo VS Code Remote SSH sem
precisar instalar nada na máquina local.

---

## Etapa 8 — Configurar Git

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git config --global init.defaultBranch main
```

---

## Etapa 9 — Clonar o repositório

```bash
mkdir -p /srv/vozsite
cd /srv/vozsite

git clone https://github.com/seunome/vozsite.git .

# Verifica a estrutura
ls -la
```

Estrutura esperada após o clone:
```
/srv/vozsite/
  backend/
  agente/
  templates/
  infra/
  docs/
  .gitignore
  .env.exemplo
```

---

## Etapa 10 — Configurar o .env

```bash
cd /srv/vozsite

cp .env.exemplo .env
nano .env
```

Preencha todos os valores reais:

```env
# Banco de dados
BD_SENHA_ROOT=gere_uma_senha_forte_aqui
BD_USUARIO=vozsite_usuario
BD_SENHA=gere_outra_senha_forte_aqui

# Redis
REDIS_SENHA=gere_senha_redis_aqui

# Laravel
APP_CHAVE=             # gerado na Etapa 12
APP_URL=https://vozsite.com.br
APP_ENV=production
APP_DEBUG=false
APP_DOMINIO=vozsite.com.br

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=seu_webhook_secret_mp

# Telegram
TELEGRAM_WEBHOOK_SECRET=gere_um_secret_aqui

# OpenAI
OPENAI_CHAVE=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Token interno (agente → API Laravel)
API_TOKEN_INTERNO=gere_token_longo_aqui

# Email
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=seu@dominio.com
MAIL_PASSWORD=sua_senha_smtp
MAIL_FROM=noreply@vozsite.com.br
```

**Como gerar senhas fortes:**
```bash
# Gera uma senha aleatória de 32 caracteres
openssl rand -base64 32
```

---

## Etapa 11 — Configurar o DNS

No painel do seu provedor de domínio, crie os registros:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| A | @ | 123.456.789.000 | 3600 |
| A | * | 123.456.789.000 | 3600 |
| A | www | 123.456.789.000 | 3600 |

O registro `*` (wildcard) é essencial — ele faz todos os subdomínios
(`cliente.vozsite.com.br`) apontarem para a VPS automaticamente, sem
precisar criar um registro DNS para cada novo cliente.

> ⏳ Aguarde a propagação do DNS (pode levar até 24h, geralmente menos de 1h).
> Verifique com: `dig vozsite.com.br` ou `nslookup vozsite.com.br`

---

## Etapa 12 — Gerar a APP_KEY do Laravel

```bash
cd /srv/vozsite/backend

# Instala as dependências PHP
docker run --rm \
  -v $(pwd):/var/www/backend \
  -w /var/www/backend \
  composer:latest composer install --no-dev --optimize-autoloader

# Gera a chave
docker run --rm \
  -v $(pwd):/var/www/backend \
  -w /var/www/backend \
  php:8.3-cli php artisan key:generate --show
```

Copie o valor gerado e cole no `.env` em `APP_CHAVE=`.

---

## Etapa 13 — Gerar o certificado SSL wildcard

```bash
certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "vozsite.com.br" \
  -d "*.vozsite.com.br"
```

O Certbot vai pedir para você criar um registro DNS TXT para validação.
Siga as instruções na tela:

1. Certbot exibe algo como:
   ```
   Please deploy a DNS TXT record under the name:
   _acme-challenge.vozsite.com.br
   with the following value:
   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. No painel do seu provedor de DNS, crie o registro:
   | Tipo | Nome | Valor |
   |---|---|---|
   | TXT | _acme-challenge | xxxxxxxxxxxxxxxxxxx |

3. Aguarde alguns minutos e pressione Enter no terminal.

4. Certificado gerado em:
   ```
   /etc/letsencrypt/live/vozsite.com.br/fullchain.pem
   /etc/letsencrypt/live/vozsite.com.br/privkey.pem
   ```

**Renovação automática:**
```bash
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'docker exec plataforma_nginx nginx -s reload'" \
  >> /etc/crontab
```

---

## Etapa 14 — Subir os containers

```bash
cd /srv/vozsite/infra

docker compose up -d

# Acompanha os logs durante a subida
docker compose logs -f

# Verifica status de todos os containers
docker compose ps
```

Resultado esperado:
```
NAME                      STATUS
vozsite_nginx             running
vozsite_backend           running
vozsite_banco             running (healthy)
vozsite_redis             running (healthy)
vozsite_queue             running
vozsite_agente            running
vozsite_monitoramento     running
```

---

## Etapa 15 — Rodar as migrations

```bash
# Banco central da plataforma
docker exec -it vozsite_backend php artisan migrate --force

# Verifica as tabelas criadas
docker exec -it vozsite_banco mysql \
  -uvozsite_usuario -p$BD_SENHA plataforma \
  -e "SHOW TABLES;"
```

Resultado esperado:
```
+---------------------------+
| Tables_in_plataforma      |
+---------------------------+
| admins                    |
| bot_pool                  |
| cadastros_pendentes       |
| faturas                   |
| failed_jobs               |
| jobs                      |
| migrations                |
| planos                    |
| tenant_configs            |
| tenants                   |
+---------------------------+
```

---

## Etapa 16 — Otimizar o Laravel para produção

```bash
docker exec -it vozsite_backend php artisan config:cache
docker exec -it vozsite_backend php artisan route:cache
docker exec -it vozsite_backend php artisan view:cache
docker exec -it vozsite_backend php artisan event:cache
```

**O que cada cache faz:**
- `config:cache` — une todos os arquivos de config em um único arquivo lido uma vez
- `route:cache` — compila todas as rotas em um arquivo otimizado
- `view:cache` — pré-compila todos os templates Blade
- `event:cache` — indexa todos os eventos e listeners

> ⚠️ Após qualquer atualização de código, limpe e regere os caches:
> ```bash
> docker exec -it vozsite_backend php artisan optimize:clear
> docker exec -it vozsite_backend php artisan optimize
> ```

---

## Etapa 17 — Criar o primeiro admin

```bash
docker exec -it vozsite_backend php artisan tinker

# Dentro do tinker
\App\Modules\Core\Models\Admin::create([
    'nome'  => 'Seu Nome',
    'email' => 'admin@vozsite.com.br',
    'senha' => \Illuminate\Support\Facades\Hash::make('sua_senha_aqui'),
]);

exit
```

---

## Etapa 18 — Adicionar os primeiros bots ao pool

```bash
docker exec -it vozsite_backend php artisan tinker

# Para cada bot criado no BotFather, insira o token:
\App\Modules\Core\Models\BotPool::create([
    'token'    => '123456789:AABBccDDeeFFggHHiiJJkkLLmmNNooPPqq',
    'username' => 'VozSiteBot1',
    'status'   => 'disponivel',
]);

exit
```

> 💡 Crie pelo menos 10 bots antes de lançar para ter margem nos
> primeiros cadastros. Acesse @BotFather no Telegram e use /newbot.

---

## Etapa 19 — Criar os planos iniciais

```bash
docker exec -it vozsite_backend php artisan tinker

\App\Modules\Core\Models\Plano::insert([
    [
        'nome'                  => 'Básico',
        'modulos'               => json_encode(['core', 'site']),
        'limite_mensagens'      => 50,
        'limite_produtos'       => null,
        'limite_agendamentos'   => null,
        'preco_mensal'          => 97.00,
        'preco_anual'           => 970.00,
        'ativo'                 => true,
        'created_at'            => now(),
        'updated_at'            => now(),
    ],
    [
        'nome'                  => 'Pro',
        'modulos'               => json_encode(['core', 'site', 'ecommerce', 'agendamento']),
        'limite_mensagens'      => 200,
        'limite_produtos'       => 100,
        'limite_agendamentos'   => 100,
        'preco_mensal'          => 197.00,
        'preco_anual'           => 1970.00,
        'ativo'                 => true,
        'created_at'            => now(),
        'updated_at'            => now(),
    ],
    [
        'nome'                  => 'Business',
        'modulos'               => json_encode(['core', 'site', 'ecommerce', 'agendamento', 'cardapio']),
        'limite_mensagens'      => 1000,
        'limite_produtos'       => null,
        'limite_agendamentos'   => null,
        'preco_mensal'          => 597.00,
        'preco_anual'           => 5970.00,
        'ativo'                 => true,
        'created_at'            => now(),
        'updated_at'            => now(),
    ],
]);

exit
```

---

## Etapa 20 — Registrar os webhooks dos bots do pool

Para cada bot adicionado ao pool, registre o webhook apontando para o worker:

```bash
# Substitua {TOKEN} pelo token de cada bot
curl -X POST \
  "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://vozsite.com.br/webhook",
    "secret_token": "SEU_TELEGRAM_WEBHOOK_SECRET",
    "allowed_updates": ["message"]
  }'

# Verifica se o webhook foi registrado
curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
```

---

## Etapa 21 — Configurar backup automático

```bash
mkdir -p /srv/vozsite/backups

# Cria o script de backup
cat > /srv/vozsite/infra/scripts/backup.sh << 'EOF'
#!/bin/bash
set -e

DIRETORIO_BACKUP="/srv/vozsite/backups"
DATA=$(date +%Y-%m-%d_%H-%M)
ARQUIVO="${DIRETORIO_BACKUP}/backup_${DATA}.sql.gz"

mkdir -p "$DIRETORIO_BACKUP"

docker exec vozsite_banco \
  sh -c "mysqldump -u root -p\${MYSQL_ROOT_PASSWORD} --all-databases" \
  | gzip > "$ARQUIVO"

find "$DIRETORIO_BACKUP" -name "*.sql.gz" -mtime +30 -delete

echo "$(date) — Backup gerado: $ARQUIVO"
EOF

chmod +x /srv/vozsite/infra/scripts/backup.sh

# Agenda para todo dia às 02:00
echo "0 2 * * * root /srv/vozsite/infra/scripts/backup.sh >> /var/log/backup-vozsite.log 2>&1" \
  >> /etc/crontab

# Testa o backup manualmente
/srv/vozsite/infra/scripts/backup.sh
```

---

## Etapa 22 — Configurar o Uptime Kuma

1. Acesse `http://123.456.789.000:3001` no navegador
2. Crie o usuário administrador
3. Adicione os seguintes monitors:

| Nome | Tipo | URL/Host |
|---|---|---|
| API Laravel | HTTP | `https://vozsite.com.br/api/health` |
| Nginx | HTTP | `https://vozsite.com.br` |
| Banco MySQL | TCP Port | `localhost:3306` |
| Redis | TCP Port | `localhost:6379` |
| Agente Python | HTTP | `http://localhost:8443/health` |

Configure alertas por email ou Telegram para cada monitor.

> ⚠️ Bloqueie a porta 3001 do firewall após configurar —
> o Uptime Kuma não precisa ficar exposto publicamente:
> ```bash
> ufw deny 3001
> ```

---

## Etapa 23 — Verificação final

```bash
# Todos os containers rodando
docker compose -f /srv/vozsite/infra/docker-compose.yml ps

# Health check da API
curl https://vozsite.com.br/api/health

# Resultado esperado:
# {"status":"ok","banco":"ok","redis":"ok","timestamp":"..."}

# Logs sem erros críticos
docker compose -f /srv/vozsite/infra/docker-compose.yml logs --tail=50

# Acessa o painel admin
# https://vozsite.com.br/admin
```

---

## Etapa 24 — Primeiro commit pós-implantação

```bash
cd /srv/vozsite

git add .
git commit -m "chore: implantação inicial em produção"
git push origin main
```

---

## Procedimentos operacionais

### Atualizar o código em produção
```bash
cd /srv/vozsite
git pull origin main
docker compose -f infra/docker-compose.yml build backend agente
docker compose -f infra/docker-compose.yml up -d
docker exec vozsite_backend php artisan migrate --force
docker exec vozsite_backend php artisan optimize:clear
docker exec vozsite_backend php artisan optimize
```

### Reiniciar um serviço específico
```bash
docker compose -f /srv/vozsite/infra/docker-compose.yml restart backend
docker compose -f /srv/vozsite/infra/docker-compose.yml restart agente
docker compose -f /srv/vozsite/infra/docker-compose.yml restart nginx
```

### Ver logs em tempo real
```bash
# Todos os serviços
docker compose -f /srv/vozsite/infra/docker-compose.yml logs -f

# Serviço específico
docker compose -f /srv/vozsite/infra/docker-compose.yml logs -f agente
docker compose -f /srv/vozsite/infra/docker-compose.yml logs -f backend
```

### Restaurar um backup
```bash
# Lista os backups disponíveis
ls -lh /srv/vozsite/backups/

# Restaura um backup específico
gunzip < /srv/vozsite/backups/backup_2024-01-15_02-00.sql.gz \
  | docker exec -i vozsite_banco mysql -u root -p$BD_SENHA_ROOT
```

### Adicionar bots ao pool
```bash
docker exec -it vozsite_backend php artisan tinker

\App\Modules\Core\Models\BotPool::create([
    'token'    => 'TOKEN_DO_NOVO_BOT',
    'username' => 'VozSiteBot10',
    'status'   => 'disponivel',
]);
```

### Suspender um tenant manualmente
```bash
docker exec -it vozsite_backend php artisan tinker

\App\Modules\Core\Models\Tenant::where('slug', 'slug-do-tenant')
    ->update(['status' => 'suspenso', 'suspenso_em' => now()]);
```

---

## Checklist de implantação

- [ ] Sistema atualizado (`apt update && apt upgrade`)
- [ ] Dependências instaladas (git, curl, ufw, fail2ban, certbot)
- [ ] Firewall configurado (22, 80, 443 abertas)
- [ ] Fail2ban ativo
- [ ] SSH hardening aplicado (somente chave)
- [ ] Docker instalado e funcionando
- [ ] Node.js e Claude Code instalados
- [ ] Git configurado
- [ ] Repositório clonado em `/srv/vozsite`
- [ ] `.env` criado e preenchido com valores reais
- [ ] DNS configurado (A para @ e *)
- [ ] DNS propagado (verificado com `dig`)
- [ ] Certificado SSL wildcard gerado
- [ ] Renovação automática do SSL configurada
- [ ] Containers Docker rodando sem erros
- [ ] Migrations do banco central executadas (10 tabelas)
- [ ] Laravel otimizado para produção (caches gerados)
- [ ] Primeiro admin criado
- [ ] Planos criados (Básico, Pro, Business)
- [ ] Bots adicionados ao pool (mínimo 10)
- [ ] Webhooks dos bots registrados
- [ ] Backup automático configurado (cron 02:00)
- [ ] Backup manual testado com sucesso
- [ ] Uptime Kuma configurado com monitors e alertas
- [ ] Porta 3001 bloqueada no firewall
- [ ] Health check respondendo: `{"status":"ok",...}`
- [ ] Painel admin acessível em `https://vozsite.com.br/admin`
- [ ] Primeiro commit pós-implantação feito

**🚀 Plataforma implantada e pronta para receber os primeiros clientes.**
