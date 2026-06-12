<?php

namespace App\Modules\Site\Jobs;

use App\Modules\Core\Models\Cliente;
use App\Modules\Core\Services\GerenciadorCliente;
use App\Modules\Site\Models\SiteConfig;
use App\Modules\Site\Models\SiteVersao;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

class ReconstruirSite implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 300;

    public function __construct(
        private readonly int $clienteId,
    ) {}

    public function handle(GerenciadorCliente $gerenciadorCliente): void
    {
        $cliente = Cliente::findOrFail($this->clienteId);
        $gerenciadorCliente->configurarConexao($cliente);

        $versao = SiteVersao::where('status', 'pendente')->latest()->first();

        if ($versao) {
            $versao->update(['status' => 'construindo']);
        }

        $tipoSite     = $cliente->tipo_site ?? 'landing-page';
        $templateDir  = base_path("../../templates/{$tipoSite}");
        $outputDir    = "/app/sites/{$cliente->slug}";
        $tempDir      = sys_get_temp_dir() . "/build_{$cliente->slug}_" . time();

        try {
            if (!File::isDirectory($templateDir)) {
                throw new \RuntimeException("Template não encontrado: {$templateDir}");
            }

            File::copyDirectory($templateDir, $tempDir);

            $config = SiteConfig::all()->mapWithKeys(fn($r) => [$r->chave => $this->deserializar($r->valor)])->toArray();

            File::put(
                "{$tempDir}/site.config.json",
                json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            );

            $build = Process::path($tempDir)
                ->timeout(240)
                ->run('npm install --prefer-offline && npm run build');

            if (!$build->successful()) {
                throw new \RuntimeException("Build falhou:\n" . $build->errorOutput());
            }

            File::ensureDirectoryExists($outputDir);
            File::copyDirectory("{$tempDir}/out", $outputDir);

            if ($versao) {
                $versao->update([
                    'status'       => 'publicado',
                    'publicado_em' => now(),
                ]);
            }

        } finally {
            if (File::isDirectory($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        $cliente = Cliente::find($this->clienteId);
        if (!$cliente) {
            return;
        }

        app(GerenciadorCliente::class)->configurarConexao($cliente);

        SiteVersao::where('status', 'construindo')
            ->latest()
            ->first()
            ?->update(['status' => 'falhou']);
    }

    private function deserializar(string $valor): mixed
    {
        $decoded = json_decode($valor, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $valor;
    }
}
