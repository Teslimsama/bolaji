<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->string('field_name'); // phone | email | dob | occupation | bio | photo
            $table->string('visibility')->default('family'); // public | family | private
            $table->timestamps();

            $table->unique(['family_member_id', 'field_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('privacy_settings');
    }
};