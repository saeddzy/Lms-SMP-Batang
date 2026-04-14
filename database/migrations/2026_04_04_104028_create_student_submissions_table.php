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
        Schema::create('student_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('submitted_at')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->string('mime_type')->nullable();
            $table->text('content')->nullable(); // for text submissions
            $table->decimal('score', 5, 2)->nullable(); // max 999.99
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('graded_at')->nullable();
            $table->enum('status', ['draft', 'submitted', 'late', 'graded'])->default('draft');
            $table->timestamps();

            // Prevent duplicate submissions per task-student
            $table->unique(['task_id', 'student_id']);
            $table->index(['task_id', 'status']);
            $table->index(['student_id', 'submitted_at']);
            $table->index(['graded_by', 'graded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_submissions');
    }
};
