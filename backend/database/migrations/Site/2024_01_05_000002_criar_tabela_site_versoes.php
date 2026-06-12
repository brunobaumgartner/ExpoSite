<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_versoes', function (Blueprint $table) {
            $table->id();
            $table->json('snapshot');
            $table->string('mensagem', 255)->nullable();
            $table->enum('status', ['pendente', 'construindo', 'publicado', 'falhou'])->default('pendente');
            $table->timestamp('publicado_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_versoes');
    }
};
