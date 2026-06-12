<?php

namespace App\Modules\Site\Models;

use Illuminate\Database\Eloquent\Model;

class SiteVersao extends Model
{
    protected $connection = 'cliente';
    protected $table      = 'site_versoes';

    protected $fillable = ['snapshot', 'mensagem', 'status', 'publicado_em'];

    protected $casts = [
        'snapshot'     => 'array',
        'publicado_em' => 'datetime',
    ];
}
