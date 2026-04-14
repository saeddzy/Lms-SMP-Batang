<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `quiz_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay') NOT NULL DEFAULT 'multiple_choice'");
            DB::statement('ALTER TABLE `quiz_questions` MODIFY `correct_answer` TEXT NULL');

            if (Schema::hasTable('exam_questions')) {
                DB::statement("ALTER TABLE `exam_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay') NOT NULL DEFAULT 'multiple_choice'");
                DB::statement('ALTER TABLE `exam_questions` MODIFY `correct_answer` TEXT NULL');
            }
        }

        if (Schema::hasTable('quiz_attempt_answers')) {
            Schema::table('quiz_attempt_answers', function (Blueprint $table) {
                if (! Schema::hasColumn('quiz_attempt_answers', 'points_awarded')) {
                    $table->decimal('points_awarded', 8, 2)->nullable()->after('is_correct');
                }
                if (! Schema::hasColumn('quiz_attempt_answers', 'teacher_feedback')) {
                    $table->text('teacher_feedback')->nullable()->after('points_awarded');
                }
                if (! Schema::hasColumn('quiz_attempt_answers', 'graded_at')) {
                    $table->timestamp('graded_at')->nullable()->after('teacher_feedback');
                }
                if (! Schema::hasColumn('quiz_attempt_answers', 'graded_by')) {
                    $table->foreignId('graded_by')->nullable()->after('graded_at')->constrained('users')->nullOnDelete();
                }
            });
        }

        if (Schema::hasTable('exam_attempt_answers')) {
            Schema::table('exam_attempt_answers', function (Blueprint $table) {
                if (! Schema::hasColumn('exam_attempt_answers', 'points_awarded')) {
                    $table->decimal('points_awarded', 8, 2)->nullable()->after('is_correct');
                }
                if (! Schema::hasColumn('exam_attempt_answers', 'teacher_feedback')) {
                    $table->text('teacher_feedback')->nullable()->after('points_awarded');
                }
                if (! Schema::hasColumn('exam_attempt_answers', 'graded_at')) {
                    $table->timestamp('graded_at')->nullable()->after('teacher_feedback');
                }
                if (! Schema::hasColumn('exam_attempt_answers', 'graded_by')) {
                    $table->foreignId('graded_by')->nullable()->after('graded_at')->constrained('users')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (Schema::hasTable('exam_attempt_answers')) {
            Schema::table('exam_attempt_answers', function (Blueprint $table) {
                foreach (['graded_by', 'graded_at', 'teacher_feedback', 'points_awarded'] as $col) {
                    if (Schema::hasColumn('exam_attempt_answers', $col)) {
                        if ($col === 'graded_by') {
                            $table->dropForeign(['graded_by']);
                        }
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if (Schema::hasTable('quiz_attempt_answers')) {
            Schema::table('quiz_attempt_answers', function (Blueprint $table) {
                foreach (['graded_by', 'graded_at', 'teacher_feedback', 'points_awarded'] as $col) {
                    if (Schema::hasColumn('quiz_attempt_answers', $col)) {
                        if ($col === 'graded_by') {
                            $table->dropForeign(['graded_by']);
                        }
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `quiz_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer') NOT NULL DEFAULT 'multiple_choice'");
            DB::statement('ALTER TABLE `quiz_questions` MODIFY `correct_answer` TEXT NOT NULL');
            if (Schema::hasTable('exam_questions')) {
                DB::statement("ALTER TABLE `exam_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer') NOT NULL DEFAULT 'multiple_choice'");
                DB::statement('ALTER TABLE `exam_questions` MODIFY `correct_answer` TEXT NOT NULL');
            }
        }
    }
};
