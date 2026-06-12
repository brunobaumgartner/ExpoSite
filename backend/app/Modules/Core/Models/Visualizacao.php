<?php

namespace App\Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;

class Visualizacao extends Model
{
    protected $table = 'visualizacoes';

    public $timestamps = false;

    protected $fillable = ['cliente_id', 'caminho', 'ip_hash', 'referrer'];
}
