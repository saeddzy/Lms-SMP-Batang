<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Isi class_id dari class_subjects bila kosong (agar relasi schoolClass & filter konsisten).
     */
    public function up(): void
    {
        DB::table('materials')
            ->whereNull('class_id')
            ->whereNotNull('class_subject_id')
            ->orderBy('id')
            ->chunkById(100, function ($rows): void {
                foreach ($rows as $row) {
                    $classId = DB::table('class_subjects')
                        ->where('id', $row->class_subject_id)
                        ->value('class_id');
                    if ($classId) {
                        DB::table('materials')
                            ->where('id', $row->id)
                            ->update(['class_id' => $classId]);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
