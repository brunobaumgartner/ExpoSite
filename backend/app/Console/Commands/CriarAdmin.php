<?php

namespace App\Console\Commands;

use App\Modules\Core\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CriarAdmin extends Command
{
    protected $signature   = 'admin:criar {nome} {email} {senha}';
    protected $description = 'Cria uma conta de administrador da plataforma';

    public function handle(): int
    {
        if (Admin::where('email', $this->argument('email'))->exists()) {
            $this->error('Já existe um admin com este e-mail.');
            return self::FAILURE;
        }

        Admin::create([
            'nome'  => $this->argument('nome'),
            'email' => $this->argument('email'),
            'senha' => Hash::make($this->argument('senha')),
        ]);

        $this->info("Admin '{$this->argument('nome')}' criado com sucesso.");
        return self::SUCCESS;
    }
}
