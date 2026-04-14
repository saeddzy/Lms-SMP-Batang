<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create classes
        $classes = [
            ['name' => '7 A', 'description' => 'Kelas 7 A', 'academic_year' => '2026', 'teacher_id' => 1],
            ['name' => '7 B', 'description' => 'Kelas 7 B', 'academic_year' => '2026-2027', 'teacher_id' => 1],
        ];

        foreach ($classes as $classData) {
            SchoolClass::create($classData);
        }

        // Get subjects and teacher
        $subjects = Subject::all();
        $teacher = User::where('email', 'guru@example.com')->first();

        if ($teacher && $subjects->count() > 0) {
            // Create class_subjects for each class and subject
            $classes = SchoolClass::all();
            foreach ($classes as $class) {
                foreach ($subjects as $subject) {
                    ClassSubject::create([
                        'class_id' => $class->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teacher->id,
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}