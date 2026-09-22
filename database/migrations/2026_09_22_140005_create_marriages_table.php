<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marriages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_one_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->foreignId('person_two_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->string('status')->default('married'); // married | divorced | widowed
            $table->foreignId('verified_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique(['person_one_id', 'person_two_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marriages');
    }
};