<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cadastros_pendentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_id')->constrained('planos');
            $table->string('slug', 100)->unique();
            $table->string('email', 150);
            $table->string('tipo_site', 50);
            $table->json('dados')->nullable();
            $table->string('referencia_pagamento', 100)->nullable();
            $table->enum('status', ['aguardando_pagamento', 'provisionando', 'concluido', 'falhou'])->default('aguardando_pagamento');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cadastros_pendentes');
    }
};
