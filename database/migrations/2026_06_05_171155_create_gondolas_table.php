<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gondolas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('color', 7)->default('#475569');
            $table->integer('posicion_x')->default(0); // Coordenada entera de 0 a 100
            $table->integer('posicion_y')->default(0); // Coordenada entera de 0 a 100
            $table->integer('ancho')->default(16);     // Ancho por defecto en unidades de grilla
            $table->integer('alto')->default(6);       // Alto por defecto en unidades de grilla
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gondolas');
    }
};
