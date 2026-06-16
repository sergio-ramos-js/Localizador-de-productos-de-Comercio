<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Gondola;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoController extends Controller
{
    // Mostrar la pantalla de inventario de productos
    public function index()
    {
        return Inertia::render('Admin/ProductosManager', [
            // Traemos los productos junto con la información de su góndola
            'productos' => Producto::with('gondola')->get(),
            // Traemos las góndolas para que el administrador elija en el selector dropdown
            'gondolas' => Gondola::all()
        ]);
    }

    // Guardar el producto desde el formulario de React
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'gondola_id' => 'nullable|exists:gondolas,id',
        ]);

        Producto::create([
            'nombre' => $request->nombre,
            'gondola_id' => $request->gondola_id ?: null,
        ]);

        return redirect()->back(); // Refresca los datos en la pantalla con Inertia
    }

    // Eliminar un producto
    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);
        $producto->delete();

        return redirect()->back();
    }

    // 🔄 Actualizar la información de un producto (Cambio de góndola, nombre, etc.)
    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'gondola_id' => 'nullable|exists:gondolas,id',
        ]);

        $producto->update([
            'nombre' => $request->nombre,
            'gondola_id' => $request->gondola_id ?: null,
        ]);

        return redirect()->back(); // Inertia refresca el listado automáticamente
    }
}