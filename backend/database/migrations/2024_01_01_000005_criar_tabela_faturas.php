<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('referencia_externa', 100)->nullable();
            $table->decimal('valor', 10, 2);
            $table->enum('status', ['pendente', 'pago', 'cancelado', 'reembolsado'])->default('pendente');
            $table->timestamp('pago_em')->nullable();
            $table->timestamp('vence_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faturas');
    }
};
