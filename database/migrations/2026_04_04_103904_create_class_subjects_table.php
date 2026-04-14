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
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->json('schedule')->nullable(); // Store class schedule as JSON
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Composite unique key to prevent duplicate class-subject-teacher combinations
            $table->unique(['class_id', 'subject_id', 'teacher_id']);
            $table->index(['class_id', 'is_active']);
            $table->index(['subject_id', 'is_active']);
            $table->index(['teacher_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_subjects');
    }
};
