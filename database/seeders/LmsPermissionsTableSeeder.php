<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class LmsPermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Classes permissions
            'classes index',
            'classes create',
            'classes edit',
            'classes delete',
            'classes view',
            'classes manage_students',

            // Subjects permissions
            'subjects index',
            'subjects create',
            'subjects edit',
            'subjects delete',
            'subjects view',

            // Enrollments permissions
            'enrollments index',
            'enrollments create',
            'enrollments delete',
            'enrollments view',

            // Materials permissions
            'materials index',
            'materials create',
            'materials edit',
            'materials delete',
            'materials download',
            'materials view',

            // Tasks permissions
            'tasks index',
            'tasks create',
            'tasks edit',
            'tasks delete',
            'tasks grade',
            'tasks view_submissions',
            'tasks view',

            // Submissions permissions
            'submissions index',
            'submissions create',
            'submissions grade',
            'submissions view',

            // Quizzes permissions
            'quizzes index',
            'quizzes create',
            'quizzes edit',
            'quizzes delete',
            'quizzes take',
            'quizzes grade',
            'quizzes view_results',
            'quizzes view',

            // Exams permissions
            'exams index',
            'exams create',
            'exams edit',
            'exams delete',
            'exams conduct',
            'exams grade',
            'exams view',

            // Grades permissions
            'grades index',
            'grades view_personal',
            'grades view_all',
            'grades calculate',
            'grades export',

            // Dashboard permissions
            'dashboard admin',
            'dashboard teacher',
            'dashboard student',

            // Student menu
            'student classes',

            // System permissions
            'system analytics',
            'system settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
