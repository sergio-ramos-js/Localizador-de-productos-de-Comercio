<?php

use App\Http\Controllers\GondolaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ClienteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
Route::get('/admin/gondolas', [GondolaController::class, 'index'])->name('gondolas.index');
Route::post('/admin/gondolas/{id}/posicion', [GondolaController::class, 'updatePosition'])->name('gondolas.updatePosition');

// Rutas nuevas del ABM
Route::post('/admin/gondolas', [GondolaController::class, 'store'])->name('gondolas.store');
Route::delete('/admin/gondolas/{id}', [GondolaController::class, 'destroy'])->name('gondolas.destroy');

// Rutas del ABM de Productos
Route::get('/admin/productos', [ProductoController::class, 'index'])->name('productos.index');
Route::post('/admin/productos', [ProductoController::class, 'store'])->name('productos.store');
Route::delete('/admin/productos/{id}', [ProductoController::class, 'destroy'])->name('productos.destroy');

// Ruta generador de QR
Route::get('/admin/qr', function () {
        return Inertia::render('Admin/QrGenerator', [
            // Le pasamos la URL base del sitio para que el QR sea dinámico y use tu dominio real
            'urlBuscar' => url('/buscar') 
        ]);
    })->name('admin.qr');

// Rutas GPS local
Route::get('/buscar', [ClienteController::class, 'index'])->name('cliente.buscar');

require __DIR__ . '/settings.php';
