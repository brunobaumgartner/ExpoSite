# Plataforma SaaS — Fase 7: Hardening e Produção

## Objetivo
Plataforma pronta para receber clientes reais. Segurança auditada, backups
automáticos, monitoramento com alertas, CI/CD configurado e documentação
final completa.

## Dependências
- Fases 1 a 6 concluídas e testadas
- Repositório no GitHub configurado
- Domínio apontado para a VPS

---

## Etapa 1 — Hardening do servidor

```bash
# Desativa login root por senha (SSH apenas por chave)
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Confirma que fail2ban está ativo
systemctl status fail2ban

# Verifica regras do firewall
ufw status verbose
# Esperado: apenas 22, 80, 443 abertas
```

**Por que desativar login por senha?**
Ataques de força bruta testam combinações de usuário/senha automaticamente.
Com login apenas por chave SSH, essa categoria de ataque se torna impossível
independente da força da senha.

---

## Etapa 2 — Headers de segurança no Nginx

Adicione ao bloco `server` do Nginx:

```nginx
# Headers de segurança — adicionados ao bloco server do plataforma.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self';
  frame-src https://www.mercadopago.com.br;
" always;
```

---

## Etapa 3 — Configurar HTTPS e renovação automática do SSL

```bash
# Configura renovação automática do certificado
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'nginx -s reload'" \
  >> /etc/crontab

# Testa a renovação (sem aplicar)
certbot renew --dry-run
```

---

## Etapa 4 — Backup automático diário

Crie `/srv/plataforma/infra/scripts/backup.sh`:

```bash
#!/bin/bash
# ================================================================
# Backup diário do banco de dados da plataforma
# Executado pelo cron às 02:00 todo dia
# Mantém os últimos 30 dias de backup
# ================================================================

set -e

DIRETORIO_BACKUP="/srv/plataforma/backups"
DATA=$(date +%Y-%m-%d_%H-%M)
CONTAINER="plataforma_banco"
BANCO="plataforma"
ARQUIVO="${DIRETORIO_BACKUP}/backup_${DATA}.sql.gz"

mkdir -p "$DIRETORIO_BACKUP"

# Exporta o banco central + todos os schemas de tenant
docker exec "$CONTAINER" \
  sh -c "mysqldump -u root -p\${MYSQL_ROOT_PASSWORD} --all-databases" \
  | gzip > "$ARQUIVO"

echo "Backup gerado: $ARQUIVO"

# Remove backups com mais de 30 dias
find "$DIRETORIO_BACKUP" -name "*.sql.gz" -mtime +30 -delete

echo "Backups antigos removidos."
```

```bash
chmod +x /srv/plataforma/infra/scripts/backup.sh

# Adiciona ao cron — backup todo dia às 02:00
echo "0 2 * * * root /srv/plataforma/infra/scripts/backup.sh >> /var/log/backup-plataforma.log 2>&1" \
  >> /etc/crontab
```

---

## Etapa 5 — Instalar o Uptime Kuma para monitoramento

```bash
# Adiciona ao docker-compose
cat >> /srv/plataforma/infra/docker-compose.yml << 'EOF'

  monitoramento:
    image: louislam/uptime-kuma:latest
    container_name: plataforma_monitoramento
    restart: unless-stopped
    volumes:
      - dados_monitoramento:/app/data
    ports:
      - "3001:3001"
EOF
```

Configure os monitors no Uptime Kuma (acesse via `http://IP:3001`):
- Backend Laravel (`https://suaplataforma.com.br/api/health`)
- Worker do agente Python
- Banco de dados (porta 3306 interna)
- Redis (porta 6379 interna)

**Por que Uptime Kuma?**
É self-hosted, gratuito, e envia alertas por email, Telegram ou webhook
quando qualquer serviço cai. Não depende de serviços externos pagos.

---

## Etapa 6 — Criar endpoint de health check

Adicione em `/srv/plataforma/backend/routes/api.php`:

```php
Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'banco'  => \DB::connection()->getPdo() ? 'ok' : 'erro',
        'redis'  => \Cache::store('redis')->get('health_check') !== false ? 'ok' : 'erro',
        'timestamp' => now()->toIso8601String(),
    ]);
});
```

---

## Etapa 7 — Configurar CI/CD com GitHub Actions

Crie `/srv/plataforma/.github/workflows/deploy.yml`:

```yaml
name: Deploy para produção

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host:     ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key:      ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /srv/plataforma
            git pull origin main
            docker compose -f infra/docker-compose.yml build backend agente
            docker compose -f infra/docker-compose.yml up -d
            docker exec plataforma_backend php artisan migrate --force
            docker exec plataforma_backend php artisan config:cache
            docker exec plataforma_backend php artisan route:cache
            docker exec plataforma_backend php artisan view:cache
            echo "Deploy concluído: $(date)"
```

**Por que cache de config/routes/views?**
Em produção, o Laravel pode fazer cache de configurações, rotas e views
para servir mais rápido. Sem cache, o framework lê todos os arquivos do
disco a cada request. Com cache, lê uma única vez e mantém em memória.

---

## Etapa 8 — Checklist OWASP Top 10

Revise cada item antes do lançamento:

```
A01 - Controle de acesso quebrado
  ✅ Middleware de tenant em todas as rotas protegidas
  ✅ Queries verificam tenant antes de retornar dados
  ✅ Policies de autorização por recurso

A02 - Falhas criptográficas
  ✅ HTTPS obrigatório (HSTS)
  ✅ Senhas com bcrypt (Hash::make)
  ✅ Tokens com length adequado (Str::random(64))
  ✅ Dados sensíveis criptografados no banco

A03 - Injeção
  ✅ Eloquent ORM com prepared statements
  ✅ Validação de input em todo controller
  ✅ Sem queries raw com input do usuário

A04 - Design inseguro
  ✅ Isolamento de tenant por schema
  ✅ Pool de bots com lock pessimista
  ✅ Webhook validado por assinatura HMAC

A05 - Configuração incorreta de segurança
  ✅ APP_DEBUG=false em produção
  ✅ Headers de segurança no Nginx
  ✅ Portas internas não expostas

A06 - Componentes vulneráveis
  [ ] Rodar composer audit
  [ ] Rodar npm audit nos templates
  [ ] Agendar revisão mensal de dependências

A07 - Falhas de identificação e autenticação
  ✅ Rate limiting no login (5 tentativas / 1 minuto)
  ✅ 2FA disponível para painel do cliente
  ✅ Tokens com expiração

A08 - Falhas de integridade de software
  ✅ Deploy via CI/CD com hash de commit
  ✅ .env nunca no repositório

A09 - Falhas de log e monitoramento
  ✅ Auditoria de todas as ações no schema do tenant
  ✅ Logs de erro centralizados
  ✅ Uptime Kuma com alertas

A10 - SSRF (Server-Side Request Forgery)
  ✅ Agente Python só chama API interna (URL configurada por env)
  ✅ Sem redirecionamento baseado em input do usuário
```

---

## Etapa 9 — Checklist LGPD final

```
Consentimento
  ✅ Checkbox explícito no cadastro (não pré-marcado)
  ✅ Versão e data do termo aceito gravados no banco
  ✅ Política de privacidade publicada

Direitos do titular
  ✅ Exportação de dados disponível no painel (portabilidade)
  ✅ Solicitação de exclusão disponível no painel
  ✅ Exclusão real após 30 dias de carência (não só soft delete)

Transparência sobre IA
  ✅ Informação sobre uso de Whisper local (sem envio de áudio)
  ✅ Informação sobre GPT-4o mini (mensagens de texto vão à OpenAI)

DPO
  [ ] Nome e contato do encarregado publicados
  [ ] Canal dpo@suaplataforma.com.br criado

Retenção
  [ ] Política de retenção documentada e aplicada
  [ ] Backups com prazo de expiração definido

Breach response
  [ ] Plano de resposta a incidentes documentado
  [ ] Fluxo de notificação à ANPD (72h) documentado
```

---

## Etapa 10 — Gerar documentação final

```bash
# Atualiza ARCHITECTURE.md com o estado final
# Revisa DECISIONS.md com decisões tomadas ao longo do desenvolvimento
# Gera README.md raiz com instruções de instalação e deploy

cd /srv/plataforma
git add .
git commit -m "feat: hardening e configurações de produção"
git push origin main
```

---

## Checklist final da Fase 7

- [ ] Login SSH por chave, senha desativada
- [ ] Headers de segurança no Nginx configurados
- [ ] Renovação automática do SSL configurada
- [ ] Backup automático diário configurado (cron 02:00)
- [ ] Retenção de 30 dias de backup configurada
- [ ] Uptime Kuma instalado e monitors configurados
- [ ] Endpoint `/api/health` criado e monitorado
- [ ] CI/CD com GitHub Actions configurado
- [ ] Cache de config/routes/views ativo em produção
- [ ] OWASP Top 10 revisado e itens pendentes resolvidos
- [ ] `composer audit` executado sem vulnerabilidades críticas
- [ ] `npm audit` executado nos templates
- [ ] Checklist LGPD completo
- [ ] DPO definido e canal de contato publicado
- [ ] Política de privacidade e termos de uso publicados
- [ ] `ARCHITECTURE.md` revisado e atualizado
- [ ] `DECISIONS.md` completo com todas as decisões
- [ ] README raiz com instruções de instalação
- [ ] Teste de carga básico executado (10 tenants simultâneos)
- [ ] Plataforma acessível em produção sem erros

**🚀 Plataforma pronta para os primeiros clientes.**
