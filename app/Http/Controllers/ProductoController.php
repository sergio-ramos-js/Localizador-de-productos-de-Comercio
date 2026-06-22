<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Gondola;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ProductosManager', [
            'productos' => Producto::with('gondolas:id,nombre')->get(),
            'gondolas' => Gondola::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'gondola_ids' => 'nullable|array',
            'gondola_ids.*' => 'exists:gondolas,id',
        ]);

        $producto = Producto::create([
            'nombre' => $request->nombre,
        ]);

        $producto->gondolas()->sync($request->gondola_ids ?? []);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);
        $producto->delete();

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'gondola_ids' => 'nullable|array',
            'gondola_ids.*' => 'exists:gondolas,id',
        ]);

        $producto->update([
            'nombre' => $request->nombre,
        ]);

        $producto->gondolas()->sync($request->gondola_ids ?? []);

        return redirect()->back();
    }
}