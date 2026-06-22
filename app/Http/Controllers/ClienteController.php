<?php

namespace App\Http\Controllers;

use App\Models\Gondola;
use App\Models\Producto;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index()
    {
        // 🚀 Obtenemos todas las góndolas y nos aseguramos de que siempre tengan un color
        $gondolas = Gondola::all()->map(function ($gondola) {
            if (empty($gondola->color)) {
                $gondola->color = '#475569'; // Gris slate por defecto si está vacío en la BD
            }
            return $gondola;
        });

        return Inertia::render('cliente/Buscador', [
            'gondolas' => $gondolas,
            'productos' => Producto::with('gondolas:id,nombre')->get()->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'gondola_ids' => $producto->gondolas->pluck('id')->values(),
                ];
            })
        ]);
    }
}