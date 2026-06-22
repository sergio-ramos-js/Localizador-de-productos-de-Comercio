<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gondola extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'color',
        'posicion_x',
        'posicion_y',
        'ancho',
        'alto',
    ];
    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'gondola_producto')->withTimestamps();
    }
}
