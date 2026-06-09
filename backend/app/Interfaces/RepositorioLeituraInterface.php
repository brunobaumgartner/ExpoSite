<?php

namespace App\Interfaces;

interface RepositorioLeituraInterface
{
    /**
     * Busca um registro pelo ID dentro do tenant atual.
     */
    public function buscarPorId(int $id): ?object;

    /**
     * Retorna todos os registros do tenant atual.
     */
    public function listarTodos(array $filtros = []): array;
}
