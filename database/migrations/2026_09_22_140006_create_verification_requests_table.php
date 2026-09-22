<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->references('id')->on('family_members')->cascadeOnDelete();
            $table->string('claimed_relationship_type'); // father | mother | grandchild | other
            $table->foreignId('claimed_related_to_id')->nullable()->references('id')->on('family_members')->nullOnDelete();
            $table->foreignId('submitted_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending | more_info | approved | rejected
            $table->foreignId('reviewed_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
    }
};