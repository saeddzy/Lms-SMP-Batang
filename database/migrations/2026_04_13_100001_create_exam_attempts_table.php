<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('exam_attempts')) {
            Schema::create('exam_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('finished_at')->nullable();
                $table->decimal('score', 5, 2)->nullable();
                $table->boolean('passed')->nullable();
                $table->timestamps();

                $table->index(['exam_id', 'student_id']);
            });
        }

        if (! Schema::hasTable('exam_attempt_answers')) {
            Schema::create('exam_attempt_answers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
                $table->unsignedBigInteger('question_id');
                $table->text('answer')->nullable();
                $table->boolean('is_correct')->default(false);
                $table->timestamps();

                $table->unique(['exam_attempt_id', 'question_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempt_answers');
        Schema::dropIfExists('exam_attempts');
    }
};
