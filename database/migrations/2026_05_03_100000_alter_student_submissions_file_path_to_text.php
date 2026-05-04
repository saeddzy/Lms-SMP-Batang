<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Path lampiran bisa panjang; VARCHAR(255) default kadang memotong nama hash + ekstensi.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE student_submissions MODIFY file_path TEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE student_submissions ALTER COLUMN file_path TYPE TEXT USING file_path::TEXT');
        }
        // SQLite: kolom string sudah fleksibel; tidak diubah.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE student_submissions MODIFY file_path VARCHAR(255) NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE student_submissions ALTER COLUMN file_path TYPE VARCHAR(255)');
        }
    }
};
