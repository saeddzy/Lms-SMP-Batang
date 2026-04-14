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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->string('mime_type')->nullable();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('class_subject_id')->nullable()->constrained('class_subjects')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['class_id', 'is_active']);
            $table->index(['class_subject_id', 'is_active']);
            $table->index(['uploaded_by', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
