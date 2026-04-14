<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin permissions (full access)
        $adminPermissions = [
            // User management (existing)
            'users index', 'users create', 'users edit', 'users delete',
            'roles index', 'roles create', 'roles edit', 'roles delete',
            'permissions index', 'permissions create', 'permissions edit', 'permissions delete',

            // Classes
            'classes index', 'classes create', 'classes edit', 'classes delete', 'classes view', 'classes manage_students',

            // Subjects
            'subjects index', 'subjects create', 'subjects edit', 'subjects delete', 'subjects view',

            // Enrollments
            'enrollments index', 'enrollments create', 'enrollments delete', 'enrollments view',

            // Materials
            'materials index', 'materials create', 'materials delete', 'materials download', 'materials view',

            // Tasks
            'tasks index', 'tasks create', 'tasks edit', 'tasks delete', 'tasks grade', 'tasks view_submissions', 'tasks view',

            // Submissions
            'submissions index', 'submissions create', 'submissions grade', 'submissions view',

            // Quizzes
            'quizzes index', 'quizzes create', 'quizzes edit', 'quizzes delete', 'quizzes take', 'quizzes grade', 'quizzes view_results', 'quizzes view',

            // Exams
            'exams index', 'exams create', 'exams edit', 'exams delete', 'exams conduct', 'exams grade', 'exams view',

            // Grades
            'grades index', 'grades view_personal', 'grades view_all', 'grades calculate', 'grades export',

            // Dashboards
            'dashboard admin', 'dashboard teacher', 'dashboard student',

            // System
            'system analytics', 'system settings',
        ];

        // Teacher permissions
        $teacherPermissions = [
            // Kelas: hanya lihat (kelas yang mapelnya diampu); CRUD & siswa oleh admin
            'classes index', 'classes view',

            // Subjects
            'subjects index', 'subjects view',

            // Enrollments
            'enrollments index', 'enrollments view',

            // Materials
            'materials index', 'materials create', 'materials delete', 'materials download', 'materials view',

            // Tasks
            'tasks index', 'tasks create', 'tasks edit', 'tasks delete', 'tasks grade', 'tasks view_submissions', 'tasks view',

            // Submissions
            'submissions index', 'submissions grade', 'submissions view',

            // Quizzes
            'quizzes index', 'quizzes create', 'quizzes edit', 'quizzes delete', 'quizzes grade', 'quizzes view_results', 'quizzes view',

            // Exams
            'exams index', 'exams create', 'exams edit', 'exams delete', 'exams conduct', 'exams grade', 'exams view',

            // Grades
            'grades index', 'grades view_all', 'grades calculate', 'grades export',

            // Dashboard
            'dashboard teacher',
        ];

        // Student permissions
        $studentPermissions = [
            // Classes
            'classes index', 'classes view', 'student classes',

            // Subjects
            'subjects index', 'subjects view',

            // Enrollments
            'enrollments index', 'enrollments view',

            // Materials
            'materials index', 'materials download', 'materials view',

            // Tasks
            'tasks index', 'tasks view',

            // Submissions
            'submissions index', 'submissions create', 'submissions view',

            // Quizzes
            'quizzes index', 'quizzes take', 'quizzes view_results', 'quizzes view',

            // Exams
            'exams index', 'exams conduct', 'exams view',

            // Grades
            'grades index', 'grades view_personal',

            // Dashboard
            'dashboard student',
        ];

        // Assign permissions to roles
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->syncPermissions($adminPermissions);
        }

        $teacherRole = Role::where('name', 'guru')->first();
        if ($teacherRole) {
            $teacherRole->syncPermissions($teacherPermissions);
        }

        $studentRole = Role::where('name', 'siswa')->first();
        if ($studentRole) {
            $studentRole->syncPermissions($studentPermissions);
        }
    }
}
