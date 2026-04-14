<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (! Schema::hasColumn('exams', 'scheduled_date')) {
                $table->timestamp('scheduled_date')->nullable()->after('instructions');
            }
            if (! Schema::hasColumn('exams', 'duration_minutes')) {
                $table->unsignedInteger('duration_minutes')->nullable()->after('scheduled_date');
            }
            if (! Schema::hasColumn('exams', 'total_questions')) {
                $table->unsignedInteger('total_questions')->nullable()->after('duration_minutes');
            }
            if (! Schema::hasColumn('exams', 'is_cancelled')) {
                $table->boolean('is_cancelled')->default(false);
            }
            if (! Schema::hasColumn('exams', 'max_attempts')) {
                $table->unsignedTinyInteger('max_attempts')->default(1);
            }
            if (! Schema::hasColumn('exams', 'rules')) {
                $table->text('rules')->nullable();
            }
            if (! Schema::hasColumn('exams', 'requires_supervision')) {
                $table->boolean('requires_supervision')->default(false);
            }
            if (! Schema::hasColumn('exams', 'allow_review')) {
                $table->boolean('allow_review')->default(false);
            }
        });

        if (! Schema::hasTable('exam_questions')) {
            Schema::create('exam_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->text('question_text');
                $table->enum('question_type', ['multiple_choice', 'true_false', 'short_answer'])->default('multiple_choice');
                $table->json('options')->nullable();
                $table->string('correct_answer');
                $table->decimal('points', 5, 2)->default(1);
                $table->unsignedInteger('order')->default(0);
                $table->text('explanation')->nullable();
                $table->timestamps();

                $table->index(['exam_id', 'order']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_questions');

        Schema::table('exams', function (Blueprint $table) {
            foreach ([
                'scheduled_date',
                'duration_minutes',
                'total_questions',
                'is_cancelled',
                'max_attempts',
                'rules',
                'requires_supervision',
                'allow_review',
            ] as $col) {
                if (Schema::hasColumn('exams', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
