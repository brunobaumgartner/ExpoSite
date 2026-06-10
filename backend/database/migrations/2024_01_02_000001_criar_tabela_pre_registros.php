<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pre_registros', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->string('nome_empresa', 200);
            $table->string('email', 150)->unique();
            $table->string('telefone', 30);
            $table->string('cpf', 14)->unique();
            $table->string('tipo_site', 50);
            $table->string('slug_desejado', 100)->nullable();
            $table->text('senha');
            $table->json('dados')->nullable();
            $table->string('token', 64)->unique();
            $table->enum('status', ['pendente', 'confirmado', 'ativado', 'cancelado'])->default('pendente');
            $table->timestamp('confirmado_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pre_registros');
    }
};
