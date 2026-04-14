<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            if (Schema::hasTable('quiz_questions')) {
                DB::statement('ALTER TABLE `quiz_questions` MODIFY `correct_answer` TEXT NOT NULL');
            }
            if (Schema::hasTable('exam_questions')) {
                DB::statement('ALTER TABLE `exam_questions` MODIFY `correct_answer` TEXT NOT NULL');
            }
        } elseif ($driver === 'sqlite') {
            // SQLite: recreate if needed — development only; skip or use full table rebuild
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            if (Schema::hasTable('quiz_questions')) {
                DB::statement('ALTER TABLE `quiz_questions` MODIFY `correct_answer` VARCHAR(255) NOT NULL');
            }
            if (Schema::hasTable('exam_questions')) {
                DB::statement('ALTER TABLE `exam_questions` MODIFY `correct_answer` VARCHAR(255) NOT NULL');
            }
        }
    }
};
