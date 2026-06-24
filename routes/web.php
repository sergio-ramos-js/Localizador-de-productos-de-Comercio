<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GondolaController;
use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 🌍 RUTAS PÚBLICAS (Cualquier usuario o cliente con el QR puede entrar)
Route::inertia('/', 'welcome')->name('home');
Route::get('/buscar', [ClienteController::class, 'index'])->name('cliente.buscar');


// 🔒 RUTAS PROTEGIDAS (Solo entran administradores logueados)
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Panel de Góndolas
    Route::get('/admin/gondolas', [GondolaController::class, 'index'])->name('gondolas.index');
    Route::post('/admin/gondolas', [GondolaController::class, 'store'])->name('gondolas.store');
    Route::put('/admin/gondolas/{id}', [GondolaController::class, 'update'])->name('gondolas.update');
    Route::post('/admin/gondolas/{id}/posicion', [GondolaController::class, 'updatePosition'])->name('gondolas.updatePosition');
    Route::delete('/admin/gondolas/{id}', [GondolaController::class, 'destroy'])->name('gondolas.destroy');

    // Panel de Productos
    Route::get('/admin/productos', [ProductoController::class, 'index'])->name('productos.index');
    Route::post('/admin/productos', [ProductoController::class, 'store'])->name('productos.store');
    Route::put('/admin/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/admin/productos/{id}', [ProductoController::class, 'destroy'])->name('productos.destroy');

    // Generador de QR
    Route::get('/admin/qr', function () {
        return Inertia::render('Admin/QrGenerator', [
            'urlBuscar' => url('/buscar') 
        ]);
    })->name('admin.qr');
});

require __DIR__ . '/settings.php';