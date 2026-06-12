<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('cliente')->create('logs_atividade', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['mensagem', 'atualizacao_site', 'rollback', 'sistema'])->default('mensagem');
            $table->string('acao', 100)->nullable();
            $table->text('descricao')->nullable();
            $table->unsignedInteger('tokens_usados')->default(0);
            $table->enum('status', ['sucesso', 'erro'])->default('sucesso');
            $table->timestamp('created_at')->useCurrent();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::connection('cliente')->dropIfExists('logs_atividade');
    }
};
