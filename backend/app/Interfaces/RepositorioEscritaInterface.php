<?php

namespace App\Interfaces;

interface RepositorioEscritaInterface
{
    /**
     * Persiste um novo registro no banco.
     */
    public function criar(array $dados): object;

    /**
     * Atualiza um registro existente pelo ID.
     */
    public function atualizar(int $id, array $dados): object;

    /**
     * Remove um registro pelo ID (soft delete).
     */
    public function remover(int $id): bool;
}
