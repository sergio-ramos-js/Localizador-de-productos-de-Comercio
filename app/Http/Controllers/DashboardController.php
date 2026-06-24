<?php

namespace App\Http\Controllers;

use App\Models\Gondola;
use App\Models\Producto;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'productos' => Producto::count(),
                'gondolas' => Gondola::count(),
                // Futuro: múltiples mapas guardados y activables
                'mapas' => 1,
            ],
            'gondolas' => Gondola::all(),
        ]);
    }
}