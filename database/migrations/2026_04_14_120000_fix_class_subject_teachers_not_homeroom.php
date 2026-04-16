<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Data lama: class_subjects.teacher_id diisi sama dengan wali kelas saat buat kelas,
 * sehingga wali dianggap mengampu semua mapel. Sesuaikan ke guru mapel master (subjects.teacher_id).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            UPDATE class_subjects AS cs
            INNER JOIN school_classes AS sc ON cs.class_id = sc.id
            INNER JOIN subjects AS s ON cs.subject_id = s.id
            SET cs.teacher_id = s.teacher_id
            WHERE cs.teacher_id IS NOT NULL
              AND sc.teacher_id IS NOT NULL
              AND cs.teacher_id = sc.teacher_id
        ');
    }

    public function down(): void
    {
        //
    }
};
