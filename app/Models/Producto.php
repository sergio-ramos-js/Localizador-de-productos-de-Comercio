<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    // Tabla asociada
    protected $table = 'productos';

    // Columnas que permitimos llenar masivamente desde el formulario
    protected $fillable = ['nombre', 'codigo_barras', 'gondola_id'];

    // Relación inversa: Un producto pertenece a una Góndola
    public function gondola()
    {
        return $this->belongsTo(Gondola::class, 'gondola_id');
    }
}