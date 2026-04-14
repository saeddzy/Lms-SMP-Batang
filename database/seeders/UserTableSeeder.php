<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::firstOrCreate([
            'email' => 'izaldev@gmail.com',
        ], [
            'name' => 'Syahrizaldev',
            'password' => bcrypt('password'),
        ]);

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }

        // Create teacher user
        $teacher = User::firstOrCreate([
            'email' => 'guru@example.com',
        ], [
            'name' => 'Guru SMP',
            'password' => bcrypt('password'),
        ]);

        $teacherRole = Role::where('name', 'guru')->first();
        if ($teacherRole) {
            $teacher->assignRole($teacherRole);
        }

        // Create student user
        $student = User::firstOrCreate([
            'email' => 'siswa@example.com',
        ], [
            'name' => 'Siswa SMP',
            'password' => bcrypt('password'),
        ]);

        $studentRole = Role::where('name', 'siswa')->first();
        if ($studentRole) {
            $student->assignRole($studentRole);
        }
    }
}
