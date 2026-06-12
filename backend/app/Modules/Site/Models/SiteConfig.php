<?php

namespace App\Modules\Site\Models;

use Illuminate\Database\Eloquent\Model;

class SiteConfig extends Model
{
    protected $connection = 'cliente';
    protected $table      = 'site_configs';

    protected $fillable = ['chave', 'valor'];
}
