# Plataforma SaaS — Fase 4: Sites e Templates

## Objetivo
Agente consegue criar e publicar o site do cliente através de uma conversa
de onboarding. O site é gerado a partir de um template Next.js com as
configurações do tenant injetadas, publicado no subdomínio correto com SSL
automático, e cada alteração é versionada.

## Dependências
- Fases 1, 2 e 3 concluídas
- Wildcard DNS configurado (*.suaplataforma.com.br → IP da VPS)
- Certbot instalado para SSL automático

---

## Etapa 1 — Configurar wildcard DNS e SSL

No provedor de DNS, crie dois registros:
```
Tipo A   @              → IP_DA_VPS
Tipo A   *.             → IP_DA_VPS
```

Instale o Certbot e gere o certificado wildcard:

```bash
apt install -y certbot python3-certbot-nginx

certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "suaplataforma.com.br" \
  -d "*.suaplataforma.com.br"
```

**Por que wildcard SSL?**
Um certificado wildcard (`*.suaplataforma.com.br`) cobre todos os
subdomínios com um único certificado. Sem ele, seria necessário gerar um
certificado individual para cada novo tenant — inviável para automação.

---

## Etapa 2 — Configurar Nginx para wildcard

Crie `/srv/plataforma/infra/nginx/conf.d/plataforma.conf`:

```nginx
# Roteamento principal da plataforma
server {
    listen 80;
    server_name suaplataforma.com.br www.suaplataforma.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name suaplataforma.com.br www.suaplataforma.com.br;

    ssl_certificate     /etc/letsencrypt/live/suaplataforma.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaplataforma.com.br/privkey.pem;

    # Painel admin e API
    location / {
        proxy_pass         http://backend:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

# Sites dos tenants — subdomínio wildcard
server {
    listen 80;
    server_name ~^(?<slug>[^.]+)\.suaplataforma\.com\.br$;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ~^(?<slug>[^.]+)\.suaplataforma\.com\.br$;

    ssl_certificate     /etc/letsencrypt/live/suaplataforma.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaplataforma.com.br/privkey.pem;

    root /srv/plataforma/sites/$slug/out;
    index index.html;

    # Next.js static export
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # API pública do tenant (produtos, agendamentos)
    location /api/ {
        proxy_pass       http://backend:8000/api/publica/$slug/;
        proxy_set_header Host $host;
    }
}
```

**Por que `$slug` na regex do Nginx?**
A regex captura o subdomínio como variável `$slug` e a usa para apontar
para o diretório do site gerado (`/srv/plataforma/sites/$slug/out`). Assim,
um único bloco de configuração serve todos os tenants sem precisar gerar
configuração Nginx por cliente.

---

## Etapa 3 — Criar a estrutura de templates

```bash
cd /srv/plataforma/templates

# Cada template é um projeto Next.js independente
for tipo in landing-page institucional ecommerce cardapio agendamento; do
  mkdir -p $tipo/components
  mkdir -p $tipo/pages
  mkdir -p $tipo/public
  touch $tipo/site.schema.json
  touch $tipo/site.default.json
done
```

---

## Etapa 4 — Criar o schema do template landing-page

Crie `/srv/plataforma/templates/landing-page/site.schema.json`:

```json
{
  "campos": {
    "nome_negocio":      { "tipo": "texto",  "obrigatorio": true,  "pergunta": "Qual o nome do seu negócio?" },
    "slogan":            { "tipo": "texto",  "obrigatorio": false, "pergunta": "Tem um slogan? (opcional)" },
    "descricao":         { "tipo": "texto",  "obrigatorio": true,  "pergunta": "Descreva seu negócio em uma frase." },
    "telefone":          { "tipo": "texto",  "obrigatorio": true,  "pergunta": "Qual o telefone ou WhatsApp de contato?" },
    "endereco":          { "tipo": "texto",  "obrigatorio": false, "pergunta": "Qual o endereço? (opcional)" },
    "cor_primaria":      { "tipo": "cor",    "obrigatorio": true,  "pergunta": "Qual a cor principal da sua marca? (ex: azul, #1a73e8)" },
    "cor_secundaria":    { "tipo": "cor",    "obrigatorio": false, "pergunta": "Tem uma cor secundária?" },
    "logo":              { "tipo": "imagem", "obrigatorio": false, "pergunta": "Me manda uma foto do seu logo." },
    "foto_hero":         { "tipo": "imagem", "obrigatorio": false, "pergunta": "Tem uma foto para o banner principal?" },
    "redes_sociais":     { "tipo": "objeto", "obrigatorio": false, "pergunta": "Tem Instagram, Facebook ou outra rede? Me manda os links." }
  },
  "secoes": ["hero", "sobre", "servicos", "contato"]
}
```

---

## Etapa 5 — Criar o migration do módulo Site no tenant

Crie `/srv/plataforma/backend/database/migrations/Site/2024_01_04_000001_criar_tabela_site_config.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('tenant')->create('site_config', function (Blueprint $table) {
            $table->id();
            $table->string('chave', 100)->unique();
            $table->text('valor')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('tenant')->dropIfExists('site_config');
    }
};
```

---

## Etapa 6 — Criar o SiteService no Laravel

Crie `/srv/plataforma/backend/app/Modules/Site/Services/SiteService.php`:

```php
<?php

namespace App\Modules\Site\Services;

use App\Modules\Core\Models\Tenant;
use App\Modules\Site\Models\SiteConfig;
use App\Modules\Site\Models\SiteVersao;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class SiteService
{
    /**
     * Atualiza uma ou mais configurações do site e dispara o rebuild.
     */
    public function atualizar(Tenant $tenant, array $configuracoes, string $mensagem): array
    {
        foreach ($configuracoes as $chave => $valor) {
            SiteConfig::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valor]
            );
        }

        $snapshot = SiteConfig::all()->pluck('valor', 'chave')->toArray();

        SiteVersao::create([
            'config_snapshot' => $snapshot,
            'mensagem'        => $mensagem,
        ]);

        $this->disparar Rebuild($tenant);

        return ['mensagem' => "✅ Site atualizado! As mudanças aparecem em instantes."];
    }

    /**
     * Retorna as últimas versões do site para exibição no painel/agente.
     */
    public function listarVersoes(int $limite = 10): array
    {
        return SiteVersao::latest('criado_em')
            ->limit($limite)
            ->get(['id', 'mensagem', 'criado_em'])
            ->toArray();
    }

    /**
     * Restaura o site para uma versão anterior e dispara rebuild.
     */
    public function rollback(Tenant $tenant, int $versaoId): array
    {
        $versao = SiteVersao::findOrFail($versaoId);

        foreach ($versao->config_snapshot as $chave => $valor) {
            SiteConfig::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valor]
            );
        }

        SiteVersao::create([
            'config_snapshot' => $versao->config_snapshot,
            'mensagem'        => "Rollback para versão #{$versaoId}",
        ]);

        $this->dispararRebuild($tenant);

        return ['mensagem' => "✅ Site restaurado para a versão #{$versaoId}."];
    }

    /**
     * Dispara o job de rebuild do site em background via fila.
     */
    private function dispararRebuild(Tenant $tenant): void
    {
        \App\Modules\Site\Jobs\RebuildSiteJob::dispatch($tenant->id);
    }
}
```

---

## Etapa 7 — Criar o Job de rebuild do site

Crie `/srv/plataforma/backend/app/Modules/Site/Jobs/RebuildSiteJob.php`:

```php
<?php

namespace App\Modules\Site\Jobs;

use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Services\TenantService;
use App\Modules\Site\Models\SiteConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

class RebuildSiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 10;

    public function __construct(
        private readonly int $tenantId
    ) {}

    /**
     * Gera e publica o site do tenant a partir do template e das configurações atuais.
     */
    public function handle(TenantService $tenantService): void
    {
        $tenant = Tenant::findOrFail($this->tenantId);

        $tenantService->configurarConexao($tenant);

        $tipoSite    = $tenant->config('tipo_site');
        $configuracoes = SiteConfig::all()->pluck('valor', 'chave')->toArray();

        $diretorioTemplate = base_path("../../templates/{$tipoSite}");
        $diretorioSaida    = "/srv/plataforma/sites/{$tenant->slug}";

        // Copia o template para um diretório de trabalho temporário
        $diretorioTemp = sys_get_temp_dir() . "/build_{$tenant->slug}_" . time();
        File::copyDirectory($diretorioTemplate, $diretorioTemp);

        // Injeta as configurações no arquivo de config do Next.js
        $configJson = json_encode($configuracoes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        File::put("{$diretorioTemp}/site.config.json", $configJson);

        // Executa o build do Next.js
        Process::path($diretorioTemp)
            ->run('npm ci && npm run build')
            ->throw();

        // Move o output para o diretório final
        File::ensureDirectoryExists($diretorioSaida);
        File::copyDirectory("{$diretorioTemp}/out", "{$diretorioSaida}/out");

        // Remove o diretório temporário
        File::deleteDirectory($diretorioTemp);
    }
}
```

---

## Etapa 8 — Criar o onboarding conversacional no agente

Crie `/srv/plataforma/agente/nucleo/onboarding.py`:

```python
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class Onboarding:
    """
    Conduz a conversa de onboarding para coletar os dados necessários
    para gerar o site do tenant. Cada tipo de site tem seu próprio schema.
    """

    def __init__(self) -> None:
        self.schemas = self._carregar_schemas()

    def _carregar_schemas(self) -> dict:
        """
        Carrega todos os schemas de templates disponíveis.
        """
        schemas     = {}
        caminho_base = Path('/app/templates')

        for tipo in ['landing-page', 'institucional', 'ecommerce', 'cardapio', 'agendamento']:
            arquivo = caminho_base / tipo / 'site.schema.json'
            if arquivo.exists():
                schemas[tipo] = json.loads(arquivo.read_text())

        return schemas

    def proximo_campo(self, tipo_site: str, dados_coletados: dict) -> dict | None:
        """
        Retorna o próximo campo que precisa ser coletado, ou None se todos
        os campos obrigatórios já foram preenchidos.
        """
        schema = self.schemas.get(tipo_site, {})
        campos = schema.get('campos', {})

        for nome, definicao in campos.items():
            if definicao['obrigatorio'] and nome not in dados_coletados:
                return {'nome': nome, 'definicao': definicao}

        return None

    def onboarding_completo(self, tipo_site: str, dados_coletados: dict) -> bool:
        """
        Verifica se todos os campos obrigatórios foram coletados.
        """
        return self.proximo_campo(tipo_site, dados_coletados) is None
```

---

## Etapa 9 — Rodar as migrations do módulo Site

```bash
docker exec -it plataforma_backend php artisan migrate \
  --path=database/migrations/Site \
  --database=tenant \
  --force
```

---

## Checklist final da Fase 4

- [ ] Wildcard DNS configurado no provedor
- [ ] Certificado SSL wildcard gerado com Certbot
- [ ] Configuração Nginx para wildcard criada
- [ ] Estrutura de diretórios dos templates criada
- [ ] `site.schema.json` criado para landing-page
- [ ] Migration `site_config` criada para o tenant
- [ ] `SiteService` criado (atualizar, listarVersoes, rollback)
- [ ] `RebuildSiteJob` criado (build Next.js em background)
- [ ] Onboarding conversacional criado no agente
- [ ] Diretório `/srv/plataforma/sites/` criado com permissões corretas
- [ ] Teste end-to-end: onboarding via Telegram → site publicado no subdomínio
- [ ] Rollback testado: site volta à versão anterior corretamente

**Fase 4 concluída → partir para a Fase 5 (Painel do Cliente)**
