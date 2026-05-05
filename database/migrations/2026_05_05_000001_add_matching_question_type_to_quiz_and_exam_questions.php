<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `quiz_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay','matching') NOT NULL DEFAULT 'multiple_choice'");

        if (DB::getSchemaBuilder()->hasTable('exam_questions')) {
            DB::statement("ALTER TABLE `exam_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay','matching') NOT NULL DEFAULT 'multiple_choice'");
        }
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `quiz_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay') NOT NULL DEFAULT 'multiple_choice'");

        if (DB::getSchemaBuilder()->hasTable('exam_questions')) {
            DB::statement("ALTER TABLE `exam_questions` MODIFY `question_type` ENUM('multiple_choice','true_false','short_answer','essay') NOT NULL DEFAULT 'multiple_choice'");
        }
    }
};
