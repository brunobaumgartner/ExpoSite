<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacotes_avulsos', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('tarefas');
            $table->decimal('preco', 10, 2);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        DB::table('pacotes_avulsos')->insert([
            ['tarefas' => 10, 'preco' => 15.00, 'ativo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['tarefas' => 20, 'preco' => 25.00, 'ativo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['tarefas' => 30, 'preco' => 35.00, 'ativo' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::create('compras_avulsas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('pacote_id')->constrained('pacotes_avulsos');
            $table->string('referencia_pagamento', 100)->nullable();
            $table->enum('status', ['pendente', 'aprovado', 'cancelado'])->default('pendente');
            $table->unsignedInteger('mes');
            $table->unsignedSmallInteger('ano');
            $table->timestamp('aprovado_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras_avulsas');
        Schema::dropIfExists('pacotes_avulsos');
    }
};
