<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->nullable()->references('id')->on('family_members')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('type')->default('photo'); // photo | document | video
            $table->string('visibility')->default('family'); // public | family | private
            $table->foreignId('uploaded_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('caption')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};