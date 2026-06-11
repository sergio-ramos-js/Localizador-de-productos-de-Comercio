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
    // Añade este método antes de cerrar la llave del modelo Gondola
    public function productos()
    {
        return $this->hasMany(Producto::class, 'gondola_id');
    }
}
