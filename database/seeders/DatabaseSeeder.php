<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);

        User::create([
            'name' => 'sergio',
            'email' => 'sergio@ramos.com',
            'password' => bcrypt('123123123')
        ]);

        // 🔥 Solo inyecta productos de prueba si estás en tu PC local/desarrollo
        if (app()->environment('local', 'testing')) {
            $this->call([
                GondolaSeeder::class,
                ProductSeeder::class,
            ]);
        }
    }
}
