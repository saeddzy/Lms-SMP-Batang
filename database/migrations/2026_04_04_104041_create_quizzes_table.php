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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->unsignedInteger('time_limit')->nullable(); // in minutes
            $table->unsignedInteger('total_questions')->default(0);
            $table->decimal('max_score', 5, 2)->default(100); // max 999.99
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('class_subject_id')->nullable()->constrained('class_subjects')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_randomized')->default(false);
            $table->boolean('show_results')->default(true);
            $table->timestamps();

            $table->index(['class_id', 'is_active']);
            $table->index(['class_subject_id', 'is_active']);
            $table->index(['created_by', 'created_at']);
            $table->index(['start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
