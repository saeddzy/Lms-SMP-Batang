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
        Schema::create('student_quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('answer'); // student's answer text
            $table->boolean('is_correct')->default(false);
            $table->decimal('points_earned', 5, 2)->default(0); // max 999.99
            $table->timestamp('answered_at')->useCurrent();
            $table->timestamps();

            // Prevent duplicate answers per question-student-quiz
            $table->unique(['quiz_id', 'question_id', 'student_id']);
            $table->index(['quiz_id', 'student_id']);
            $table->index(['question_id', 'is_correct']);
            $table->index(['student_id', 'answered_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_quiz_answers');
    }
};
