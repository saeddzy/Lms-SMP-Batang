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
        Schema::create('final_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('student_enrollments')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('component_id')->constrained('grade_components')->onDelete('cascade');
            $table->string('academic_year'); // e.g., "2024/2025"
            $table->decimal('score', 5, 2)->nullable(); // actual score (0-100)
            $table->decimal('weighted_score', 5, 2)->nullable(); // score * component weight
            $table->text('remarks')->nullable();
            $table->foreignId('calculated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();

            // Composite unique key to prevent duplicate grades
            $table->unique(['enrollment_id', 'subject_id', 'component_id', 'academic_year'], 'final_grades_unique');
            $table->index(['student_id', 'subject_id', 'academic_year']);
            $table->index(['class_id', 'subject_id']);
            $table->index(['component_id', 'calculated_at']);
            $table->index('academic_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_grades');
    }
};
