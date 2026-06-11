<?php

namespace App\Http\Controllers;

use App\Models\Gondola;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GondolaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/MapaDesigner', [
            'gondolasIniciales' => Gondola::all()
        ]);
    }

    public function updatePosition(Request $request, $id)
    {
        // 🚀 CORRECCIÓN 1: Quitamos 'between:0,100' para permitir un mapa infinito
        $request->validate([
            'posicion_x' => 'required|integer',
            'posicion_y' => 'required|integer',
        ]);

        $gondola = Gondola::findOrFail($id);
        $gondola->update([
            'posicion_x' => $request->posicion_x,
            'posicion_y' => $request->posicion_y,
        ]);

        // 🚀 CORRECCIÓN 2: Cambiamos el JSON plano por el retorno nativo de Inertia
        // Esto elimina el error de "All Inertia requests must receive a valid Inertia response"
        return redirect()->back();
    }

    // NUEVO: Crear una góndola nueva desde la UI
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'color' => 'nullable|string|size:7',
        ]);

        Gondola::create([
            'nombre' => $request->nombre,
            'color' => $request->color ?? '#475569',
            'posicion_x' => 40, // Aparece centrada
            'posicion_y' => 40,
            'ancho' => 15,      // Tamaño estándar inicial
            'alto' => 6,
        ]);

        return redirect()->back(); // Recarga los datos automáticamente con Inertia
    }

    // NUEVO: Eliminar una góndola de la base de datos
    public function destroy($id)
    {
        $gondola = Gondola::findOrFail($id);
        $gondola->delete();

        return redirect()->back();
    }
}