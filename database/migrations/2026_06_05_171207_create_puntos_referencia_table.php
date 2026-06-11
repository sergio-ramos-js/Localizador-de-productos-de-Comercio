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
        Schema::create('puntos_referencia', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->enum('tipo', ['entrada', 'salida', 'caja', 'decorativo'])->default('caja');
            $table->integer('posicion_x');
            $table->integer('posicion_y');
            $table->integer('ancho')->default(4);
            $table->integer('alto')->default(4);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('puntos_referencia');
    }
};
