<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gondola;
use App\Models\Producto;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Grupos de productos comerciales reales
        $categoriasDeProductos = [
            [
                'Azúcar', 'Aceite de girasol', 'Arroz', 'Fideos', 'Harina', 
                'Sal', 'Puré de tomate', 'Mayonesa', 'Yerba mate', 'Café', 'Galletas de agua'
            ],
            [
                'Leche entera', 'Yogur', 'Manteca', 'Queso crema', 
                'Queso rallado', 'Crema de leche', 'Dulce de leche', 'Jamón cocido', 'Salame'
            ],
            [
                'Detergente', 'Jabón líquido', 'Suavizante', 'Lavandina', 
                'Desodorante de ambientes', 'Limpiador de pisos', 'Esponja de cocina'
            ],
            [
                'Champú', 'Acondicionador', 'Jabón de tocador', 'Crema dental', 
                'Desodorante', 'Papel higiénico', 'Rollos de cocina'
            ],
            [
                'Gaseosa', 'Agua mineral', 'Jugo en polvo', 'Cerveza', 
                'Vino tinto', 'Fernet', 'Agua tónica'
            ]
        ];

        $gondolas = Gondola::all();

        if ($gondolas->isEmpty()) {
            $this->command->error('❌ No se encontraron elementos en la tabla gondolas. Corre primero el GondolaSeeder.');
            return;
        }

        $contadorGondolasComerciales = 0;

        foreach ($gondolas as $gondola) {
            // Pasamos a minúsculas y limpiamos el nombre para comparar de forma segura
            $slugNombre = Str::slug($gondola->nombre); 

            // 🛑 DETECCIÓN DE ELEMENTOS ESTRUCTURALES
            if (Str::contains($slugNombre, ['bano', 'salida', 'entrada', 'caja'])) {
                $nombreProductoVirtual = Str::title(str_replace('-', ' ', $slugNombre));

                Producto::create([
                    'nombre' => $nombreProductoVirtual,
                    'gondola_id' => $gondola->id,
                ]);

                $this->command->warn("🧩 Creado producto de mapa: '{$nombreProductoVirtual}' asignado a la ubicación '{$gondola->nombre}'.");
                continue; 
            }

            // 🧮 REPARTICIÓN ÚNICA PARA GÓNDOLAS COMERCIALES
            // Solo insertamos si todavía nos quedan listas de categorías disponibles en el array
            if ($contadorGondolasComerciales < count($categoriasDeProductos)) {
                $productosAInsertar = $categoriasDeProductos[$contadorGondolasComerciales];

                foreach ($productosAInsertar as $nombreProducto) {
                    Producto::create([
                        'nombre' => $nombreProducto,
                        'gondola_id' => $gondola->id,
                    ]);
                }

                $this->command->info("✅ Vinculados " . count($productosAInsertar) . " productos reales únicos a la '{$gondola->nombre}'.");
            } else {
                // Si tienes más góndolas comerciales que categorías, estas quedarán vacías para que las uses en tus pruebas manuales
                $this->command->line("ℹ️ '{$gondola->nombre}' se creó vacía (sin productos iniciales asignados).");
            }

            $contadorGondolasComerciales++;
        }

        $this->command->info("🌟 ¡Seeder completado! Base de datos sincronizada perfectamente con el plano.");
    }
}