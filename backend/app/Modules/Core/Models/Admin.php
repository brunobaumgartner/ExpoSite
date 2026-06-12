<?php

namespace App\Modules\Core\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Model implements AuthenticatableContract
{
    use SoftDeletes, Authenticatable, HasApiTokens;

    protected $table = 'admins';

    protected $fillable = ['nome', 'email', 'senha'];

    protected $hidden = ['senha'];

    public function getAuthPassword(): string
    {
        return $this->senha;
    }

    public function eAdmin(): bool
    {
        return true;
    }
}
