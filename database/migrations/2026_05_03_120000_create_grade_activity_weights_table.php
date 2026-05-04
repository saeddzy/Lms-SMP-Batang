<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_activity_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('academic_year', 32)->default('');
            $table->string('activity_type', 16);
            $table->unsignedBigInteger('activity_id');
            $table->decimal('weight', 6, 2);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(
                ['class_id', 'subject_id', 'academic_year', 'activity_type', 'activity_id'],
                'grade_activity_weights_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_activity_weights');
    }
};
