<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_id')->constrained('planos');
            $table->string('slug', 100)->unique();
            $table->string('subdominio', 150)->unique();
            $table->enum('status', ['ativo', 'suspenso', 'cancelado'])->default('ativo');
            $table->timestamp('suspenso_em')->nullable();
            $table->timestamp('cancela_em')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
