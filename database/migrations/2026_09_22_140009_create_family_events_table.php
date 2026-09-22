<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('event_date');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('visibility')->default('family'); // public | family
            $table->foreignId('created_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_events');
    }
};