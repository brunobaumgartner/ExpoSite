<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('cliente')->create('site_versoes', function (Blueprint $table) {
            $table->id();
            $table->json('config_snapshot');
            $table->string('commit_hash', 64)->nullable();
            $table->string('mensagem', 255)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::connection('cliente')->dropIfExists('site_versoes');
    }
};
