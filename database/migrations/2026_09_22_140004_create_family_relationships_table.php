<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->foreignId('child_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->string('type')->default('biological'); // biological | adopted
            $table->string('status')->default('active'); // active | removed
            $table->timestamps();

            $table->unique(['parent_id', 'child_id']);
            $table->index('child_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_relationships');
    }
};