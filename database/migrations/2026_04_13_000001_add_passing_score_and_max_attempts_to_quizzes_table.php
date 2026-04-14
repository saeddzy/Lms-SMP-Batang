<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->unsignedTinyInteger('max_attempts')->default(3)->after('show_results');
            $table->decimal('passing_score', 5, 2)->default(70)->after('max_score');
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['max_attempts', 'passing_score']);
        });
    }
};
