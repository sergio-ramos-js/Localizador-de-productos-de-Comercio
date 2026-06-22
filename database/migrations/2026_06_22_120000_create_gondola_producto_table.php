<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gondola_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('gondola_id')->constrained('gondolas')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['producto_id', 'gondola_id']);
        });

        $productos = DB::table('productos')->whereNotNull('gondola_id')->get();

        foreach ($productos as $producto) {
            DB::table('gondola_producto')->insert([
                'producto_id' => $producto->id,
                'gondola_id' => $producto->gondola_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['gondola_id']);
            $table->dropColumn('gondola_id');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('gondola_id')->nullable()->after('nombre')->constrained('gondolas')->nullOnDelete();
        });

        $pivots = DB::table('gondola_producto')
            ->select('producto_id', DB::raw('MIN(gondola_id) as gondola_id'))
            ->groupBy('producto_id')
            ->get();

        foreach ($pivots as $pivot) {
            DB::table('productos')
                ->where('id', $pivot->producto_id)
                ->update(['gondola_id' => $pivot->gondola_id]);
        }

        Schema::dropIfExists('gondola_producto');
    }
};