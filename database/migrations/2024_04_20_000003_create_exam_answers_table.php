<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Legacy: tidak dipakai aplikasi. Jawaban ujian ada di `exam_attempt_answers`
     * (migrasi 2026_04_13_100001). FK ke `questions` di sini salah (bukan exam_questions).
     */
    public function up(): void
    {
        //
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
