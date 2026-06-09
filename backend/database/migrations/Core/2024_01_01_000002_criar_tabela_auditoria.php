<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('cliente')->create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable();
            $table->string('acao', 100);
            $table->json('payload')->nullable();
            $table->json('resultado')->nullable();
            $table->enum('origem', ['agente', 'painel', 'sistema']);
            $table->string('ip', 45)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection('cliente')->dropIfExists('auditoria');
    }
};
