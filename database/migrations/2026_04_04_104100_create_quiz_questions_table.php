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
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false', 'short_answer'])->default('multiple_choice');
            $table->json('options')->nullable(); // for multiple choice questions
            $table->string('correct_answer');
            $table->decimal('points', 5, 2)->default(1); // max 999.99
            $table->unsignedInteger('order')->default(0);
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->index(['quiz_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
