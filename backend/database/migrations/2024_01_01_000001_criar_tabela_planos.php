<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->json('modulos');
            $table->unsignedInteger('limite_mensagens')->nullable();
            $table->unsignedInteger('limite_produtos')->nullable();
            $table->unsignedInteger('limite_agendamentos')->nullable();
            $table->decimal('preco_mensal', 10, 2);
            $table->decimal('preco_anual', 10, 2);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planos');
    }
};
