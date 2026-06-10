<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RegistradorModulos extends ServiceProvider
{
    private array $modulos = ['Core', 'Site', 'Ecommerce', 'Agendamento', 'Cardapio'];

    /**
     * Registra os módulos ativos e suas configurações.
     */
    public function register(): void
    {
        foreach ($this->modulos as $modulo) {
            $config = app_path("Modules/{$modulo}/config.php");

            if (file_exists($config)) {
                $this->mergeConfigFrom($config, strtolower($modulo));
            }
        }
    }

    /**
     * Carrega as rotas de todos os módulos registrados.
     */
    public function boot(): void
    {
        foreach ($this->modulos as $modulo) {
            $rotas = app_path("Modules/{$modulo}/routes/api.php");

            if (file_exists($rotas)) {
                require $rotas;
            }
        }
    }
}
