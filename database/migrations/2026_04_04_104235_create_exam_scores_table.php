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
        Schema::create('exam_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('enrollment_id')->constrained('student_enrollments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->decimal('marks_obtained', 5, 2)->nullable(); // max 999.99
            $table->decimal('percentage', 5, 2)->nullable(); // calculated percentage
            $table->enum('grade', ['A', 'B', 'C', 'D', 'E', 'F'])->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('scored_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('scored_at')->nullable();
            $table->boolean('is_absent')->default(false);
            $table->timestamps();

            // Prevent duplicate scores per exam-student
            $table->unique(['exam_id', 'student_id']);
            $table->index(['exam_id', 'enrollment_id']);
            $table->index(['student_id', 'scored_at']);
            $table->index(['scored_by', 'scored_at']);
            $table->index('grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_scores');
    }
};
