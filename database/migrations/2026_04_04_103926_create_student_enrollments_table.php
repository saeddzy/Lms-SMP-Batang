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
        Schema::table('student_enrollments', function (Blueprint $table) {
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->enum('status', ['active', 'inactive', 'graduated', 'transferred'])->default('active');
            $table->text('notes')->nullable();

            // Prevent duplicate enrollments
            $table->unique(['student_id', 'class_id']);
            $table->index(['student_id', 'status']);
            $table->index(['class_id', 'status']);
            $table->index('enrolled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropForeign(['class_id']);
            $table->dropUnique(['student_id', 'class_id']);
            $table->dropIndex(['student_id', 'status']);
            $table->dropIndex(['class_id', 'status']);
            $table->dropIndex(['enrolled_at']);
            $table->dropColumn(['student_id', 'class_id', 'enrolled_at', 'status', 'notes']);
        });
    }
};
