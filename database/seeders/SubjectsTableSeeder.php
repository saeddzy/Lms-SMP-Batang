<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            [
                'name' => 'Matematika',
                'code' => 'MTK',
                'description' => 'Pelajaran matematika untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Bahasa Indonesia',
                'code' => 'BIND',
                'description' => 'Pelajaran bahasa Indonesia untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Bahasa Inggris',
                'code' => 'BING',
                'description' => 'Pelajaran bahasa Inggris untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Ilmu Pengetahuan Alam',
                'code' => 'IPA',
                'description' => 'Pelajaran ilmu pengetahuan alam untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Ilmu Pengetahuan Sosial',
                'code' => 'IPS',
                'description' => 'Pelajaran ilmu pengetahuan sosial untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Pendidikan Agama Islam',
                'code' => 'PAI',
                'description' => 'Pelajaran pendidikan agama Islam untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Pendidikan Kewarganegaraan',
                'code' => 'PKN',
                'description' => 'Pelajaran pendidikan kewarganegaraan untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Seni Budaya',
                'code' => 'SENI',
                'description' => 'Pelajaran seni budaya untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Pendidikan Jasmani dan Olahraga',
                'code' => 'PJO',
                'description' => 'Pelajaran pendidikan jasmani dan olahraga untuk siswa SMP',
                'is_active' => true,
            ],
            [
                'name' => 'Teknologi Informasi dan Komunikasi',
                'code' => 'TIK',
                'description' => 'Pelajaran teknologi informasi dan komunikasi untuk siswa SMP',
                'is_active' => true,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate([
                'code' => $subject['code'],
            ], $subject);
        }
    }
}
