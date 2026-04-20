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
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->decimal('score', 5, 2)->nullable(); // Score in percentage
            $table->integer('total_correct')->default(0);
            $table->integer('total_questions')->default(0);
            $table->enum('attempt_status', ['in_progress', 'finished', 'submitted', 'timeout'])->default('in_progress');
            $table->integer('attempt_number')->default(1); // For multiple attempts
            $table->json('attempt_data')->nullable(); // Store additional data like IP, browser, etc.
            $table->timestamps();

            // Indexes for performance
            $table->index(['exam_id', 'user_id']);
            $table->index('attempt_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};
