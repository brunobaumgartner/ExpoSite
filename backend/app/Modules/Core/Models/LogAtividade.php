<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;

class LogAtividade extends Model
{
    protected $connection = 'cliente';

    protected $table = 'logs_atividade';

    public $timestamps = false;

    protected $fillable = ['tipo', 'acao', 'descricao', 'tokens_usados', 'status'];
}
