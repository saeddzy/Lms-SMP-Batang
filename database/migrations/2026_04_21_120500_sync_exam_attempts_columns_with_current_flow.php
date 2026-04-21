<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_attempts', 'attempt_status')) {
                $table->enum('attempt_status', ['in_progress', 'finished', 'submitted', 'timeout'])
                    ->default('in_progress')
                    ->after('finished_at');
            }

            if (!Schema::hasColumn('exam_attempts', 'attempt_number')) {
                $table->integer('attempt_number')->default(1)->after('attempt_status');
            }

            if (!Schema::hasColumn('exam_attempts', 'total_correct')) {
                $table->integer('total_correct')->default(0)->after('score');
            }

            if (!Schema::hasColumn('exam_attempts', 'total_questions')) {
                $table->integer('total_questions')->default(0)->after('total_correct');
            }

            if (!Schema::hasColumn('exam_attempts', 'attempt_data')) {
                $table->json('attempt_data')->nullable()->after('attempt_number');
            }
        });

        DB::table('exam_attempts')
            ->whereNull('attempt_status')
            ->update([
                'attempt_status' => DB::raw("CASE WHEN finished_at IS NULL THEN 'in_progress' ELSE 'finished' END"),
            ]);

        Schema::table('exam_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_attempts', 'attempt_status')) {
                return;
            }

            $sm = Schema::getConnection()->getSchemaBuilder();
            $indexes = $sm->getIndexes('exam_attempts');
            $indexNames = collect($indexes)->pluck('name')->all();

            if (!in_array('exam_attempts_attempt_status_index', $indexNames, true)) {
                $table->index('attempt_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $sm = Schema::getConnection()->getSchemaBuilder();
            $indexes = $sm->getIndexes('exam_attempts');
            $indexNames = collect($indexes)->pluck('name')->all();

            if (in_array('exam_attempts_attempt_status_index', $indexNames, true)) {
                $table->dropIndex('exam_attempts_attempt_status_index');
            }

            if (Schema::hasColumn('exam_attempts', 'attempt_data')) {
                $table->dropColumn('attempt_data');
            }

            if (Schema::hasColumn('exam_attempts', 'attempt_number')) {
                $table->dropColumn('attempt_number');
            }

            if (Schema::hasColumn('exam_attempts', 'attempt_status')) {
                $table->dropColumn('attempt_status');
            }

            if (Schema::hasColumn('exam_attempts', 'total_questions')) {
                $table->dropColumn('total_questions');
            }

            if (Schema::hasColumn('exam_attempts', 'total_correct')) {
                $table->dropColumn('total_correct');
            }
        });
    }
};
