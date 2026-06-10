<?php

namespace App\Modules\Core\Services;

use App\Modules\Core\Models\Cliente;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class GerenciadorCliente
{
    /**
     * Busca um cliente pelo subdomínio no banco central.
     */
    public function buscarPorSubdominio(string $subdominio): ?Cliente
    {
        return Cliente::where('subdominio', $subdominio)->first();
    }

    /**
     * Configura a conexão do Laravel para usar o schema do cliente.
     */
    public function configurarConexao(Cliente $cliente): void
    {
        config([
            'database.connections.cliente.database' => $cliente->nomeSchema(),
        ]);

        DB::purge('cliente');
        DB::reconnect('cliente');
    }

    /**
     * Cria o schema do cliente e roda as migrations dos módulos escolhidos.
     */
    public function provisionar(Cliente $cliente, array $modulos): void
    {
        DB::statement(
            "CREATE DATABASE IF NOT EXISTS `{$cliente->nomeSchema()}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );

        $this->configurarConexao($cliente);

        foreach ($modulos as $modulo) {
            $this->rodarMigrations($modulo);
        }
    }

    /**
     * Remove o schema do cliente permanentemente (direito ao esquecimento LGPD).
     */
    public function removerSchema(Cliente $cliente): void
    {
        DB::statement("DROP DATABASE IF EXISTS `{$cliente->nomeSchema()}`");
    }

    /**
     * Retorna os módulos necessários para cada tipo de site.
     */
    public function modulosPorTipo(string $tipoSite): array
    {
        return match ($tipoSite) {
            'ecommerce'   => ['Core', 'Site', 'Ecommerce'],
            'agendamento' => ['Core', 'Site', 'Agendamento'],
            'cardapio'    => ['Core', 'Site', 'Cardapio'],
            default       => ['Core', 'Site'],
        };
    }

    /**
     * Cria o usuário administrador no schema do cliente.
     */
    public function criarUsuarioAdmin(Cliente $cliente, array $dados): void
    {
        $this->configurarConexao($cliente);

        DB::connection('cliente')->table('usuarios')->insert([
            'nome'       => $dados['nome'],
            'email'      => $dados['email'],
            'senha'      => $dados['senha'],
            'telefone'   => $dados['telefone'],
            'perfil'     => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Executa as migrations de um módulo no schema do cliente ativo.
     */
    private function rodarMigrations(string $modulo): void
    {
        Artisan::call('migrate', [
            '--path'     => "database/migrations/{$modulo}",
            '--database' => 'cliente',
            '--force'    => true,
        ]);
    }
}
