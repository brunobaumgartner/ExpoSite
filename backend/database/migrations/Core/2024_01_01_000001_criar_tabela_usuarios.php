<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('cliente')->create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->string('email', 150)->unique();
            $table->string('senha');
            $table->string('telegram_chat_id', 50)->nullable()->unique();
            $table->string('telefone', 30)->nullable();
            $table->enum('perfil', ['admin', 'editor'])->default('admin');
            $table->string('codigo_2fa', 6)->nullable();
            $table->timestamp('codigo_2fa_expira_em')->nullable();
            $table->boolean('autenticacao_dois_fatores')->default(false);
            $table->timestamp('ultimo_acesso_em')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::connection('cliente')->dropIfExists('usuarios');
    }
};
