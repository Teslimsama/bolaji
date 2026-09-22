<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->references('id')->on('users')->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('gender')->default('female'); // male | female | other
            $table->foreignId('family_branch_id')->nullable()->references('id')->on('family_branches')->nullOnDelete();
            $table->string('photo_path')->nullable();
            $table->string('occupation')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->string('status')->default('pending'); // pending | verified | rejected
            $table->foreignId('created_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};