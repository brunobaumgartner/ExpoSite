<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bot_pool', function (Blueprint $table) {
            $table->id();
            $table->text('token');
            $table->string('username', 100)->nullable();
            $table->enum('status', ['disponivel', 'em_uso'])->default('disponivel');
            $table->foreignId('cliente_id')
                  ->nullable()
                  ->constrained('clientes')
                  ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bot_pool');
    }
};
