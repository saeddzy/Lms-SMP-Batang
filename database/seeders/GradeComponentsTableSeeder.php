<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\GradeComponent;

class GradeComponentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = Subject::all();
        $components = [
            [
                'name' => 'Tugas Harian',
                'type' => 'assignment',
                'weight' => 20.00,
                'description' => 'Penilaian tugas harian dan pekerjaan rumah',
            ],
            [
                'name' => 'Kuis',
                'type' => 'quiz',
                'weight' => 25.00,
                'description' => 'Penilaian kuis dan ulangan harian',
            ],
            [
                'name' => 'Ujian Tengah Semester',
                'type' => 'mid_term',
                'weight' => 25.00,
                'description' => 'Penilaian ujian tengah semester',
            ],
            [
                'name' => 'Ujian Akhir Semester',
                'type' => 'final',
                'weight' => 30.00,
                'description' => 'Penilaian ujian akhir semester',
            ],
        ];

        foreach ($subjects as $subject) {
            foreach ($components as $component) {
                GradeComponent::create([
                    'subject_id' => $subject->id,
                    'name' => $component['name'],
                    'type' => $component['type'],
                    'weight' => $component['weight'],
                    'description' => $component['description'],
                    'is_active' => true,
                ]);
            }
        }
    }
}
