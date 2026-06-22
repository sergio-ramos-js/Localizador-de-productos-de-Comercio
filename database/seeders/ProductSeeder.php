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
            $slugNombre = Str::slug($gondola->nombre);

            if (Str::contains($slugNombre, ['bano', 'salida', 'entrada', 'caja'])) {
                $nombreProductoVirtual = Str::title(str_replace('-', ' ', $slugNombre));

                $producto = Producto::create([
                    'nombre' => $nombreProductoVirtual,
                ]);
                $producto->gondolas()->attach($gondola->id);

                $this->command->warn("🧩 Creado producto de mapa: '{$nombreProductoVirtual}' asignado a la ubicación '{$gondola->nombre}'.");
                continue;
            }

            if ($contadorGondolasComerciales < count($categoriasDeProductos)) {
                $productosAInsertar = $categoriasDeProductos[$contadorGondolasComerciales];

                foreach ($productosAInsertar as $nombreProducto) {
                    $producto = Producto::create([
                        'nombre' => $nombreProducto,
                    ]);
                    $producto->gondolas()->attach($gondola->id);
                }

                $this->command->info("✅ Vinculados " . count($productosAInsertar) . " productos reales únicos a la '{$gondola->nombre}'.");
            } else {
                $this->command->line("ℹ️ '{$gondola->nombre}' se creó vacía (sin productos iniciales asignados).");
            }

            $contadorGondolasComerciales++;
        }

        $this->command->info("🌟 ¡Seeder completado! Base de datos sincronizada perfectamente con el plano.");
    }
}