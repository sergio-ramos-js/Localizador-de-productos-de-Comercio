<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gondola;

class GondolaSeeder extends Seeder
{
    public function run(): void
    {
        $gondolasData = [
            ['id' => 1, 'nombre' => 'ENTRADA', 'color' => '#3fc23d', 'posicion_x' => 2, 'posicion_y' => 20, 'ancho' => 15, 'alto' => 6],
            ['id' => 2, 'nombre' => 'SALIDA', 'color' => '#c91d25', 'posicion_x' => 2, 'posicion_y' => 80, 'ancho' => 15, 'alto' => 6],
            ['id' => 4, 'nombre' => 'Caja 1', 'color' => '#1b62c5', 'posicion_x' => 20, 'posicion_y' => 48, 'ancho' => 15, 'alto' => 6],
            ['id' => 5, 'nombre' => 'Caja 2', 'color' => '#3871c2', 'posicion_x' => 20, 'posicion_y' => 60, 'ancho' => 15, 'alto' => 6],
            ['id' => 6, 'nombre' => 'Caja 3', 'color' => '#326cbd', 'posicion_x' => 20, 'posicion_y' => 72, 'ancho' => 15, 'alto' => 6],
            ['id' => 8, 'nombre' => 'BAÑO', 'color' => '#bcb134', 'posicion_x' => -16, 'posicion_y' => 48, 'ancho' => 15, 'alto' => 6],
            ['id' => 9, 'nombre' => 'Gondola 1', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 10, 'ancho' => 15, 'alto' => 6],
            ['id' => 10, 'nombre' => 'Gondola 2', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 10, 'ancho' => 15, 'alto' => 6],
            ['id' => 11, 'nombre' => 'Gondola 3', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 10, 'ancho' => 15, 'alto' => 6],
            ['id' => 12, 'nombre' => 'Gondola 4', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 20, 'ancho' => 15, 'alto' => 6],
            ['id' => 13, 'nombre' => 'Gondola 5', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 20, 'ancho' => 15, 'alto' => 6],
            ['id' => 14, 'nombre' => 'Gondola 6', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 20, 'ancho' => 15, 'alto' => 6],
            ['id' => 15, 'nombre' => 'Gondola 7', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 30, 'ancho' => 15, 'alto' => 6],
            ['id' => 16, 'nombre' => 'Gondola 8', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 30, 'ancho' => 15, 'alto' => 6],
            ['id' => 17, 'nombre' => 'Gondola 9', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 30, 'ancho' => 15, 'alto' => 6],
            ['id' => 18, 'nombre' => 'Gondola 10', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 44, 'ancho' => 15, 'alto' => 6],
            ['id' => 19, 'nombre' => 'Gondola 11', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 44, 'ancho' => 15, 'alto' => 6],
            ['id' => 20, 'nombre' => 'Gondola 12', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 44, 'ancho' => 15, 'alto' => 6],
            ['id' => 22, 'nombre' => 'Gondola 13', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 54, 'ancho' => 15, 'alto' => 6],
            ['id' => 23, 'nombre' => 'Gondola 14', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 54, 'ancho' => 15, 'alto' => 6],
            ['id' => 24, 'nombre' => 'Gondola 15', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 54, 'ancho' => 15, 'alto' => 6],
            ['id' => 25, 'nombre' => 'Gondola 16', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 70, 'ancho' => 15, 'alto' => 6],
            ['id' => 26, 'nombre' => 'Gondola 17', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 70, 'ancho' => 15, 'alto' => 6],
            ['id' => 27, 'nombre' => 'Gondola 18', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 70, 'ancho' => 15, 'alto' => 6],
            ['id' => 28, 'nombre' => 'Gondola 19', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 80, 'ancho' => 15, 'alto' => 6],
            ['id' => 29, 'nombre' => 'Gondola 20', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 80, 'ancho' => 15, 'alto' => 6],
            ['id' => 30, 'nombre' => 'Gondola 21', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 80, 'ancho' => 15, 'alto' => 6],
            ['id' => 31, 'nombre' => 'Gondola 22', 'color' => '#475569', 'posicion_x' => 58, 'posicion_y' => 90, 'ancho' => 15, 'alto' => 6],
            ['id' => 32, 'nombre' => 'Gondola 23', 'color' => '#475569', 'posicion_x' => 76, 'posicion_y' => 90, 'ancho' => 15, 'alto' => 6],
            ['id' => 33, 'nombre' => 'Gondola 24', 'color' => '#475569', 'posicion_x' => 94, 'posicion_y' => 90, 'ancho' => 15, 'alto' => 6],
        ];

        foreach ($gondolasData as $data) {
            Gondola::create([
                'id'         => $data['id'],
                'nombre'     => $data['nombre'],
                'color'      => $data['color'],
                'posicion_x' => $data['posicion_x'],
                'posicion_y' => $data['posicion_y'],
                'ancho'      => $data['ancho'],
                'alto'       => $data['alto'],
            ]);
        }

        $this->command->info('✅ GondolaSeeder actualizado con los datos reales e IDs exactos del mapa.');
    }
}