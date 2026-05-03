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
        Schema::table('exam_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_attempts', 'passed')) {
                $table->boolean('passed')->nullable()->after('score');
            }

            if (Schema::hasColumn('exam_attempts', 'user_id') && !Schema::hasColumn('exam_attempts', 'student_id')) {
                // Drop foreign key if it exists before renaming
                $foreignKeys = Schema::getConnection()->getSchemaBuilder()->getForeignKeys('exam_attempts');
                foreach ($foreignKeys as $fk) {
                    if (in_array('user_id', $fk['columns'])) {
                        $table->dropForeign($fk['name']);
                    }
                }
                $table->renameColumn('user_id', 'student_id');
            }
        });

        // Re-add foreign key if needed
        Schema::table('exam_attempts', function (Blueprint $table) {
            if (Schema::hasColumn('exam_attempts', 'student_id')) {
                $foreignKeys = Schema::getConnection()->getSchemaBuilder()->getForeignKeys('exam_attempts');
                $hasFk = false;
                foreach ($foreignKeys as $fk) {
                    if (in_array('student_id', $fk['columns'])) {
                        $hasFk = true;
                        break;
                    }
                }
                if (!$hasFk) {
                    $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            if (Schema::hasColumn('exam_attempts', 'passed')) {
                $table->dropColumn('passed');
            }

            if (Schema::hasColumn('exam_attempts', 'student_id') && !Schema::hasColumn('exam_attempts', 'user_id')) {
                $foreignKeys = Schema::getConnection()->getSchemaBuilder()->getForeignKeys('exam_attempts');
                foreach ($foreignKeys as $fk) {
                    if (in_array('student_id', $fk['columns'])) {
                        $table->dropForeign($fk['name']);
                    }
                }
                $table->renameColumn('student_id', 'user_id');
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            }
        });
    }
};
