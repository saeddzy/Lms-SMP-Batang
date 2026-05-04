<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Legacy duplicate — struktur resmi (student_id, kolom ujian, dll.) dibuat di
     * 2026_04_13_100001_create_exam_attempts_table setelah tabel `exams` ada.
     * Membuat tabel di sini menyebabkan konflik urutan FK dan duplikasi dengan migrasi 2026.
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
