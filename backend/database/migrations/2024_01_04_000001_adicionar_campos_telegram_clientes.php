<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('nome', 150)->nullable()->after('email');
            $table->string('nome_empresa', 150)->nullable()->after('nome');
            $table->string('tipo_site', 50)->nullable()->after('nome_empresa');
            $table->string('telegram_chat_id', 50)->nullable()->unique()->after('tipo_site');
            $table->unsignedInteger('mensagens_usadas_mes')->default(0)->after('telegram_chat_id');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['nome', 'nome_empresa', 'tipo_site', 'telegram_chat_id', 'mensagens_usadas_mes']);
        });
    }
};
