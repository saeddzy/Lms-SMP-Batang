<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Email harus selalu terisi agar login dengan email + manajemen user tetap aman.
     * Baris yang sempat NULL diisi placeholder unik (admin bisa ganti lewat Edit user).
     */
    public function up(): void
    {
        $ids = DB::table('users')->whereNull('email')->pluck('id');

        foreach ($ids as $id) {
            DB::table('users')->where('id', $id)->update([
                'email' => 'legacy-user-'.$id.'@noreply.invalid',
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }
};
