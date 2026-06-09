<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->string('slug', 50)->unique();
            $table->string('foco', 150);
            $table->json('modulos');
            $table->unsignedInteger('limite_tarefas');
            $table->unsignedInteger('limite_produtos')->nullable();
            $table->unsignedInteger('limite_agendamentos')->nullable();
            $table->unsignedInteger('limite_usuarios')->default(1);
            $table->boolean('dominio_proprio')->default(false);
            $table->decimal('preco_mensal', 10, 2);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        DB::table('planos')->insert([
            [
                'nome'                  => 'Institucional',
                'slug'                  => 'institucional',
                'foco'                  => 'Sites de conteúdo e captação de leads',
                'modulos'               => json_encode(['core', 'site']),
                'limite_tarefas'        => 100,
                'limite_produtos'       => null,
                'limite_agendamentos'   => null,
                'limite_usuarios'       => 1,
                'dominio_proprio'       => false,
                'preco_mensal'          => 99.00,
                'ativo'                 => true,
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'nome'                  => 'Service & Agendamento',
                'slug'                  => 'service-agendamento',
                'foco'                  => 'Barbearias, salões e clínicas',
                'modulos'               => json_encode(['core', 'site', 'agendamento', 'cardapio']),
                'limite_tarefas'        => 200,
                'limite_produtos'       => null,
                'limite_agendamentos'   => 300,
                'limite_usuarios'       => 1,
                'dominio_proprio'       => false,
                'preco_mensal'          => 139.00,
                'ativo'                 => true,
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'nome'                  => 'E-commerce Starter',
                'slug'                  => 'ecommerce-starter',
                'foco'                  => 'Pequenas lojas virtuais',
                'modulos'               => json_encode(['core', 'site', 'ecommerce']),
                'limite_tarefas'        => 250,
                'limite_produtos'       => 50,
                'limite_agendamentos'   => null,
                'limite_usuarios'       => 1,
                'dominio_proprio'       => false,
                'preco_mensal'          => 159.00,
                'ativo'                 => true,
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
            [
                'nome'                  => 'E-commerce Avançado',
                'slug'                  => 'ecommerce-avancado',
                'foco'                  => 'Lojas consolidadas e equipes',
                'modulos'               => json_encode(['core', 'site', 'ecommerce', 'agendamento', 'cardapio']),
                'limite_tarefas'        => 600,
                'limite_produtos'       => null,
                'limite_agendamentos'   => null,
                'limite_usuarios'       => 3,
                'dominio_proprio'       => true,
                'preco_mensal'          => 299.00,
                'ativo'                 => true,
                'created_at'            => now(),
                'updated_at'            => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('planos');
    }
};
